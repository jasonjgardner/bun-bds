import type { Server, ServerWebSocket } from "bun";
import { subscribe } from "./pubsub";
import State from "./lib/state";
import { startup } from "./lib/bootstrap";
import { processMcpMessage } from "./mcp-integration";

let connectionUpdateInterval: NodeJS.Timer | null = null;
const COMMAND_SERVER = "http://localhost:8080/api/database";
export const state = new State();

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
      subscribe(ws, ["PlayerMessage", "commandResponse", "BlockPlaced"]);

      if (connectionUpdateInterval) {
        clearInterval(connectionUpdateInterval);
      }
      connectionUpdateInterval = setInterval(async() => {
        let commandLine = await state.getCurrentCommand();

        if (!commandLine) {
          console.log("No command to send");
          await state.loadCommands();
          commandLine = await state.getCurrentCommand();
        }

        console.log(`Sending command: ${commandLine}`);

        const content = JSON.stringify({
          header: {
            version: 1,
            requestId: state.getCurrentUUID() ?? crypto.randomUUID(),
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
      
      try {
        const data = JSON.parse(msg);
        
        // Handle regular Minecraft messages
        if (data.header?.eventName === "PlayerMessage") {
          const { message, sender } = data.body;
          console.log(await processMessage({ message, sender }));
        }
        
        // Handle MCP-specific messages from AI agents
        if (data.type === "mcp" || data.header?.messagePurpose === "mcpRequest") {
          console.log("Processing MCP message:", msg);
          await processMcpMessage(msg);
          return;
        }

        if (data.header?.messagePurpose === "commandResponse") {
          // Remove queue command from session storage, etc.
          await state.removeRequest();

          const uuid = data.header.requestId;

          await fetch(COMMAND_SERVER, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uuid
            }),
          });
          return;
        }
        
        // Handle standard Minecraft command requests
        if (data.header?.messagePurpose === "commandRequest") {
          const { commandLine } = data.body;
          respond(server, commandLine);
          console.log(`Received command: ${commandLine}`);
        }
        
        // Handle block placement events
        if (data.header?.eventName === "BlockPlaced") {
          const blockId = `${data.body.block.namespace}:${data.body.block.id}`;
          const { x, y, z } = data.body.player.position;
          console.log(`Block placed: ${blockId}`);
          console.log(`Player position: x=${x}, y=${y}, z=${z}`);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    }
  },
});

export default server;
