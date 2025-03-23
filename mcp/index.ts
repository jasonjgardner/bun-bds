import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Database } from "bun:sqlite"
import { z } from "zod";

const db = new Database("../mydb.sqlite");

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
    } finally {

    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);