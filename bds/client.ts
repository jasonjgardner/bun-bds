import { join } from "node:path";

export default async function startServer() {
  console.log("Starting Bedrock server...");
  const bdsExe = join(
    process.env.BDS_PATH ?? process.cwd(),
    "bedrock_server.exe",
  );

  const server = Bun.spawn([bdsExe], {
    cwd: process.env.BDS_PATH ?? process.cwd(),
    onExit() {
      console.log("Server exited.");
    },
    stdout: "pipe",
  });

  return await new Response(server.stdout).text();
}

if (import.meta.main) {
  console.log("Starting Bedrock server...\n", await startServer());
}