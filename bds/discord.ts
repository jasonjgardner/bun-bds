// import discord.js
import { Client, Events, GatewayIntentBits } from "discord.js";

const backendUrl = "http://localhost:8080/bds/commands";

const validCommand = new RegExp(/^fill|setblock|tp|camera|summon|give|time|tag|teleport|xp|function|playsound|ride|weather\s+.*/);

async function fetchRecentMessages() {
  try {
    const channel = await client.channels.fetch(
      process.env.DISCORD_CHANNEL_ID!
    );
    if (channel?.isTextBased()) {
      const messages = await channel.messages.fetch({ limit: 10 });
      
      messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      await Promise.all(messages.map(async (message) => {
        await Promise.all(message.attachments.map(async (attachment) => {
          const res = await fetch("http://mcstructure.deno.dev/v1/fill", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              img: attachment.url,
              axis: "x",
            }),
          });

          const data = await res.body!.getReader().read();
         console.log(new TextDecoder().decode(data.value || new Uint8Array()));
        }));

        // TODO: Convert messages to Minecraft functions
        // POST to backendUrl

        if (validCommand.test(message.content)) {
          await fetch(backendUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              command: message.content,
              sender: message.author.username
            }),
          });
        }
      }));
    } else {
      console.log("The channel is not a text channel");
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

// create a new Client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// listen for the client to be ready
client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  setInterval(async () => await fetchRecentMessages(), 5000);
});

// login with the token from .env.local
client.login(process.env.DISCORD_TOKEN);
