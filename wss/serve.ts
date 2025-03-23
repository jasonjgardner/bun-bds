import type { Server, ServerWebSocket } from "bun";
import { subscribe } from "./pubsub";
import State from "./lib/state";
import { startup } from "./lib/bootstrap";

const COMMAND_SERVER = "http://localhost:8080/bds"

let connectionUpdateInterval: NodeJS.Timer | null = null;

export const state = new State();

async function fetchCommands() {
  const response = await fetch(COMMAND_SERVER);
  if (!response.ok) {
    throw new Error("Failed to fetch commands");
  }
  return await response.json();
}

async function processMessage(
  { message, sender }: { message: string; sender: string },
) {
  const contents = message.replace(`[${sender}] `, "").trim();

  // Player message. Process chat here

  return contents;
}

function respond(server: Server, commandLine: string) {
  const uuid = crypto.randomUUID();
  const content = JSON.stringify({
    header: {
      version: 1,
      requestId: uuid,
      messageType: "commandRequest",
      messagePurpose: "commandRequest",
    },
    body: {
      version: 1,
      commandLine,
      origin: {
        type: "player",
      },
    },
  });

  server.publish("commandResponse", content);
}

const server = Bun.serve({
  reusePort: true,
  port: 3000,
  fetch(req) {
    try {
      const success = server.upgrade(req);
      if (success) {
        return undefined;
      }
    } catch (e) {
      console.error("Error upgrading request:", e);
    }
    return new Response("Not a websocket request", {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
  websocket: {
    perMessageDeflate: true,
    open: (ws: ServerWebSocket) => {
      ws.subscribe("playerUpdates");
      subscribe(ws, ["PlayerMessage", "commandResponse"]);

      if (connectionUpdateInterval) {
        clearInterval(connectionUpdateInterval);
      }
      connectionUpdateInterval = setInterval(async() => {
        let commandLine = state.getCurrentCommand();

        if (!commandLine) {
          console.log("No command to send");
          const { command } = await fetchCommands();
          commandLine = command ?? "";
        }

        console.log(`Sending command: ${commandLine}`);

        const content = JSON.stringify({
          header: {
            version: 1,
            requestId: crypto.randomUUID(),
            messageType: "commandRequest",
            messagePurpose: "commandRequest",
          },
          body: {
            version: 1,
            commandLine,
            origin: {
              type: "player",
            },
          },
        });
        server.publish("commandResponse", content);
        ws.send(content);
      }, 1000);
      startup();
    },
    close: (ws: ServerWebSocket) => {
      ws.unsubscribe("playerUpdates");
    },
    message: async (ws: ServerWebSocket, msg: string) => {
      server.publish("playerUpdates", msg);
      const data = JSON.parse(msg);
      if (data.header.eventName === "PlayerMessage") {
        const { message, sender } = data.body;
        console.log(await processMessage({ message, sender }));
      }

      if (data.header.messagePurpose === "commandResponse") {
        // Remove queue command from session storage, etc.
        state.removeRequest();
      }

      if (data.header.messagePurpose === "commandRequest") {
        const { commandLine } = data.body;
        respond(server, commandLine);

        console.log(`Received command: ${commandLine}`);
      }
    },
  },
});

export default server;
