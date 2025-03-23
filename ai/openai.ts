import OpenAI from "openai";

const { OPENAI_API_KEY } = process.env;

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: "http://127.0.0.1:1234"
});

export default async function openai(prompt: string): Promise<string[]> {
  const completion = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Act as a 3D printer which can place Minecraft Bedrock blocks. Respond with the commands to place the blocks. Use only `fill`, `setblock`, and `summon` commands, unless told otherwise. Never respond with explanations or descriptions. Only respond with simple, executable Minecraft commands.",
      },
      {
        role: "user",
        content: "Print a 5x5x5 hollow structure made of iron.",
      },
      {
        role: "assistant",
        content: "fill ~-2 ~-2 ~-2 ~2 ~2 ~2 iron_block hollow",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices
    .map((choice) => choice.message.content)
    .filter((content) => content && content.length > 0) as string[];
}
