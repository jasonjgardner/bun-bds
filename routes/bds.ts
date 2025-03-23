import { gemini, openai } from "../ai";
import { getCommands, insertCommands, updateCommand,storeBlock } from "../db";

let lastTarget: string = "eljaysun"

async function getPrompt(url: URL, request: Request) {
  const sender = url.searchParams.get("sender");
  const prompt = url.searchParams.get("prompt");

  if (prompt?.length) {
    console.log("Prompt provided", prompt);
    
    try {
      const aiCompanion = url.searchParams.get("ai") || "openai";
      const decodedPrompt = decodeURIComponent(prompt);

      let command: string[] | undefined;

      if (aiCompanion === "openai") {
        command = await openai(decodedPrompt);
        insertCommands(command, "openai");
      }

      if (aiCompanion === "gemini") {
        command = await gemini(decodedPrompt);
        insertCommands(command, "gemini");
      }

      return new Response(
        JSON.stringify({
          target: sender,
          command: (command ?? []).join(";"),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    } catch (e) {
      console.error(e);
      return new Response(
        JSON.stringify({
          target: sender,
          command: "say I'm sorry, I cannot do that.",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }
  }

  console.log("No prompt provided");
}

const validCommand = new RegExp(/^fill|setblock|tp|camera|summon|give|time|weather\s/);

const commands = Object.values(getCommands());

export default async function main(url: URL, request: Request) {
  // console.log("Handling request", url.pathname);
  // Handle POST requests first
  if (request.method === "POST" && url.pathname === "/bds/commands") {
    // Save posted commands to be read later
    const body = await request.json();
    const { command, sender } = body;

    const cmds = command.split("\n").map((cmd: string) => cmd.trim());
    const res = [];

    for (const cmd of cmds) {
      const isValid = validCommand.test(cmd);

      let idx;

      if (isValid) {
        idx = insertCommands([cmd], sender);
        commands.push(cmd);
      }

      res.push({
        idx,
        posted: isValid && idx,
      });
    }

    return new Response(
      JSON.stringify({
        result: res,
        heartbeat: Date.now(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  }

  if (url.pathname.startsWith("/bds/commands/executed/")) {
   const idx = parseInt(url.pathname.split("/").pop() || "0", 10);

    const body = await request.json();
    console.log("Executed command", idx, body);
    updateCommand(idx, body);
  }

  if (url.pathname === "/bds/prompt") {
    return getPrompt(url, request);
  }

  if (url.pathname === "/bds/block") {
    storeBlock(
      parseInt(url.searchParams.get("x") || "0", 10),
      parseInt(url.searchParams.get("y") || "0", 10),
      parseInt(url.searchParams.get("z") || "0", 10),
      url.searchParams.get("player") || "",
      url.searchParams.get("type") || ""
    );

    return new Response(
      JSON.stringify({
        heartbeat: Date.now(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  }

  if (url.pathname === "/bds/commands" || url.pathname === "/bds") {
    const command = commands.shift();

    return new Response(
      JSON.stringify({
        command,
        commands,
        target: lastTarget
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  }

  return new Response(
    JSON.stringify({
      heartbeat: Date.now(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    }
  );
}
