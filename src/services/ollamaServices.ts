import { isString } from "../utils/guards";

const OLLAMA_SYSTEM_PROMPT_OBJECT = [
  "You are a professional translator.",
  "Input will be an object where keys are category names and values are arrays of strings to translate.",
  "Translate EACH string to the target language.",
  "IMPORTANT: Return ONLY valid JSON object with the SAME keys and structure as the input.",
  "Each key should map to an array of translated strings in the same order.",
  "No comments, no extra text.",
].join(" ");

const OLLAMA_SYSTEM_PROMPT_STRING = [
  "You are a professional translator.",
  "Input will be a single string to translate.",
  "Translate the string to the target language.",
  "IMPORTANT: Return ONLY the translated string, no quotes, no JSON, no extra text.",
  "Just the translated text.",
].join(" ");

// * Template for the messages to translate text
const messagesTemplate = (language: string, jsonVal: unknown) => [
  {
    role: "system",
    content: isString(jsonVal)
      ? OLLAMA_SYSTEM_PROMPT_STRING
      : OLLAMA_SYSTEM_PROMPT_OBJECT,
  },
  {
    role: "user",
    content: isString(jsonVal)
      ? `Target language: ${language}\nText to translate: ${jsonVal}`
      : `Target language: ${language}\nJSON to translate (return JSON only, same structure):\n${JSON.stringify(
          jsonVal
        )}`,
  },
];

// * Implementation
export async function translateText<T>(input: T, language: string): Promise<T> {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3:8b",
      messages: messagesTemplate(language, input),
      stream: false,
      options: { temperature: 0, num_ctx: 2048, num_predict: 2048 },
      keep_alive: "15m",
      format: isString(input) ? undefined : "json",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const responseJson = await response.json();
  const content = responseJson.message.content;

  if (isString(input)) return content;
  else {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.warn(
        "Failed to parse translation response, returning original:",
        error
      );
      return input;
    }
  }
}
