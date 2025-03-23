const commandBlock = [
  {
    role: "user",
    parts: [
      {
        text:
          "Act as a Minecraft Bedrock Edition command block. You will respond to prompts using only valid Minecraft Bedrock Edition commands. Do not respond with formatting or any text, other than the command output without a leading slash. Do not include NBT components.",
      },
      {
        text:
          "Do not include JSON or data components in your response. Do not include any descriptions or explanations either. Simply the command to be executed in Minecraft. You may use multiple commands by separating them by lines.",
      },
      {
        text: "Place a dirt block at the player's feet.",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "setblock ~ ~-1 ~ dirt",
      },
    ],
  },
  {
    role: "user",
    parts: [
      {
        text: "Place a dark color wool block above the player.",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "setblock ~ ~ ~ black_wool",
      },
    ],
  },
  {
    role: "user",
    parts: [
      {
        text: "Place a opposite color wool blocks on each side of the player.",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "setblock ~-1 ~ ~ white_wool",
      },
      {
        text: "setblock ~1 ~ ~ black_wool",
      },
    ],
  },
];

export default commandBlock;
