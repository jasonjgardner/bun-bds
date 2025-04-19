import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Database } from "bun:sqlite";
import { z } from "zod";
import { WebSocketTransport } from "./websocket-transport";
import { registerMcpServer } from "../wss/mcp-integration";

import '../wss'

const db = new Database();

db.exec("PRAGMA journal_mode = WAL;");

const server = new McpServer({
  name: "Minecraft",
  version: "1.0.0"
});

server.resource(
  "schema",
  "schema://main",
  async (uri) => {

    try {
      const stmt = db.query("SELECT name FROM sqlite_master WHERE type='table';");
      const tableNames = stmt.all();
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(tableNames, null, 2)
        }]
      };
    } finally {
      // Cleanup if needed
      db.close();
    }
  }
);

server.tool(
  "query",
  { sql: z.string() },
  async ({ sql }) => {

    try {
      const stmt = db.query(sql);
      const results = stmt.all();

      return {
        content: [{
          type: "text",
          text: JSON.stringify(results, null, 2)
        }]
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        content: [{
          type: "text",
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Register the MCP server with the WebSocket integration
// This allows the WebSocket server to route MCP commands from AI agents
registerMcpServer(server);

// Initialize both transports - stdio for local usage and WebSocket for AI agent access
const stdioTransport = new StdioServerTransport();
const wsTransport = new WebSocketTransport();

// Connect the server to both transports
// The stdio transport is used for local debugging and interaction
await server.connect(stdioTransport);
// The WebSocket transport enables AI agents to send commands through WSS
await server.connect(wsTransport);

console.log("MCP server connected to WebSocket transport - AI agents can now send commands via WSS");