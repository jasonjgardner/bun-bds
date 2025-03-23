import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import type { Content, GenerateContentRequest } from "@google/generative-ai";
import { threeDimensionalPrinter } from "./models";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

const IMAGE_DIR = "./resources";

export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 4096,
    responseMimeType: "text/plain",
  },
});

async function urlToGenerativePart(url: URL | string) {
  console.log(url);
  const result = await fetch(url.toString().trim());
  const data = await result.arrayBuffer();
  const mimeType = result.headers.get("Content-Type");

  return {
    inlineData: {
      mimeType,
      data: `data:${mimeType};base64,${Buffer.from(data).toString("base64")}`,
    },
  };
}

async function fileToGenerativePart(path: string, mimeType = "image/png") {
  const data = await readFile(path);
  return {
    inlineData: {
      mimeType,
      data: Buffer.from(data).toString("base64")
    },
  };
}

export async function geminiImagePrompt(
  prompt: string,
  referenceImages: string[],
) {
  const parts: Array<string | any> = [
    prompt
  ];

  for (const image of referenceImages) {
    parts.push(
      image.startsWith("http")
        ? await urlToGenerativePart(image)
        : await fileToGenerativePart(join(__dirname, IMAGE_DIR, image)),
    );
  }

  const result = await model.generateContent({
      contents: [
        ...threeDimensionalPrinter,
        {
          role: "user",
          parts,
        }
      ]
});

  return result.response.text().trim()
    .replace(/`+/, "")
    .split("\n");
}

export async function gemini(prompt: string) {
  if (prompt.includes(" image-ref ")) {
    const [promptText, ...images] = prompt.split(" image-ref ");
  
    return geminiImagePrompt(promptText.replace(" image-ref ", "").trim(), images);
  } else {
    console.log('No image ref: ', prompt);
  }
  const result = (
    await model.generateContent({
      contents: [
        ...threeDimensionalPrinter,
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    })
  ).response
    .text()
    .trim()
    .replace(/`+/, "")
    .split("\n");

  return result;
}
