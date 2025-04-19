import { type Transport as BaseTransport } from "@modelcontextprotocol/sdk/shared/transport.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { state } from "../wss/serve";

/**
 * A transport implementation that connects MCP to the WebSocket server
 */
export class WebSocketTransport extends StdioServerTransport implements BaseTransport {

    constructor() {
        super();
    }

  async initialize(): Promise<void> {
    console.log("WebSocket Transport initialized for MCP");
  }

  async sendMessage(message: unknown): Promise<void> {
    // Convert the MCP message to a string if it's not already
    const messageStr = typeof message === "string" ? message : JSON.stringify(message);
    
    // Add the message to the WebSocket state so it can be sent to clients
    if (typeof message === "object" && message !== null) {
      // If this is a tool response with SQL results, we want to format it as a command
      if ('type' in message && message.type === 'toolResponse') {
        if ('content' in message && Array.isArray(message.content)) {
          // Format the result as a command that can be executed by the BDS server
          const commandLine = `say MCP: ${JSON.stringify(message.content)}`;
          state.addRequest(commandLine);
        }
      }
    }
    
    console.log("[MCP WebSocket Transport] Message sent:", messageStr);
  }

  async close(): Promise<void> {
    console.log("WebSocket Transport closed for MCP");
  }
}
