import type { ServerWebSocket } from "bun";
import type { SubscribeEvents } from "./types";
/**
 * Subscribe to events from the server
 * @param socket WebSocket connection to the server
 * @param events List of events to subscribe to
 */
export function subscribe(
  socket: ServerWebSocket,
  events: Array<string | SubscribeEvents>,
) {
  events.forEach((event) => {
    socket.send(JSON.stringify({
      header: {
        version: 1,
        requestId: crypto.randomUUID(),
        messageType: "commandRequest",
        messagePurpose: "subscribe",
      },
      body: {
        eventName: event,
      },
    }));
  });
}

export function createCommandRequest(commandLine: string) {
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

  return {
    uuid,
    content,
    timestamp: Date.now(),
    result: false,
  };
}