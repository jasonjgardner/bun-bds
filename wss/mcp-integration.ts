// Integration between WebSocket server and MCP
import { state } from "./serve";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

let mcpServerInstance: McpServer | null = null;

export function registerMcpServer(server: McpServer) {
  mcpServerInstance = server;
  console.log("MCP server registered with WebSocket integration");
}

export function getMcpServer(): McpServer | null {
  return mcpServerInstance;
}

/**
 * Process a WebSocket message that's intended for the MCP server
 */
export async function processMcpMessage(message: string): Promise<void> {
  if (!mcpServerInstance) {
    console.error("MCP server not registered");
    return;
  }

  try {
    const parsedMessage = JSON.parse(message);
    
    // Check if it's an MCP message with a tool invocation
    if (parsedMessage && parsedMessage.type === "toolInvocation" && parsedMessage.name === "query") {
      const sql = parsedMessage.parameters?.sql;
      
      if (sql) {
        // Execute the SQL query tool and get the response
        const toolResponse = await mcpServerInstance.invokeTool("query", { sql });
        
        // Format the result as a Minecraft command to be sent back via WebSocket
        if (toolResponse && toolResponse.content) {
          const resultText = typeof toolResponse.content === 'string' 
            ? toolResponse.content 
            : JSON.stringify(toolResponse.content);
            
          // Add the command to state so it will be sent through the WebSocket
          const commandLine = `tellraw @a {"text":"MCP Query Result: ${resultText.replace(/"/g, '\\"')}"}`;
          state.addRequest(commandLine);
        }
      }
    }
  } catch (error) {
    console.error("Error processing MCP message:", error);
  }
}

/**
 * Execute a Minecraft command through the WebSocket server
 */
export function executeMinecraftCommand(command: string): string {
  const uuid = state.addRequest(command);
  return uuid;
}
