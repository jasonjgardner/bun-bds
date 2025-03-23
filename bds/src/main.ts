import { GameMode, Player, system, world } from "@minecraft/server";
import type { CommandResult } from "@minecraft/server";
import { http, HttpRequestMethod } from "@minecraft/server-net";
const SERVER_URL = "http://127.0.0.1:8080/bds";
const tickSpeed = 10;

async function processCommandResponse({ body }) {
  const { command, target, heartbeat, idx } = JSON.parse(body);

  if (heartbeat || !command) {
    return;
  }

  const overworld = world.getDimension("overworld");
  const players = overworld.getPlayers({
    excludeGameModes: [GameMode.spectator],
  });

  const executed: string[] = [];

  for (const player of players) {
    if (player.name !== target) {
      continue;
    }

    await player.runCommandAsync(command);
    executed.push(idx);
  }

  return executed; 
}
function getHttpCommand() {
  http
    .get(SERVER_URL)
    .then(processCommandResponse)
    .then((executed) => {
      console.log("Executed commands:", executed);
    })
    .catch((err) => {
      console.warn(err);
    });
}
world.afterEvents.playerPlaceBlock.subscribe(({ block, player }) => {
  http
    .get(
      `${SERVER_URL}/block?x=${block.x}&y=${block.y}&z=${block.z}&player=${player.name}&type=${block.type.id}`
    )
    .then(processCommandResponse)
    .catch((err) => {
      console.warn(err);
    });
});
world.afterEvents.projectileHitBlock.subscribe((hitEvent) => {
  console.log(
    `Hit ${hitEvent.location.x}, ${hitEvent.location.y}, ${hitEvent.location.z}`
  );
  http
    .get(
      `${SERVER_URL}/hit?x=${hitEvent.location.x}&y=${hitEvent.location.y}&z=${hitEvent.location.z}`
    )
    .then(processCommandResponse)
    .catch((err) => {
      console.warn(err);
    });
});
world.afterEvents.chatSend.subscribe(
  ({ message, sender }: { message: string; sender: Player }) => {
    const pos = message.match(/(\d+),(\d+),(\d+)/gi);
    const prompt = message
      .split(":")[1]
      .replace(/(\d+),(\d+),(\d+)/gi, "")
      .trim();
    const geminiPrompt = message.toLowerCase().startsWith("gemini:");

    let url = `${SERVER_URL}/prompt?prompt=${encodeURIComponent(
      prompt
    )}&sender=${sender.name}&pos=${pos}&ai=${geminiPrompt ? "gemini" : "openai"}`;

    if (!geminiPrompt && !message.toLowerCase().startsWith("gpt4o:")) {
      return;
    }

    http
      .get(url)
      .then(processCommandResponse)
      .catch((err) => {
        console.warn(err);
      });
  }
);

system.runInterval(function intervalTick() {
  getHttpCommand();
}, tickSpeed);
