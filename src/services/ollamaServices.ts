import { OLLAMA_URL } from "../utils/constants";
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

const OLLAMA_SYSTEM_PROMPT_ANALYSIS = [
  "You are a professional analyst.",
  "Input will be a data with users and their percentages.",
  "Analyze the data and return a analysis in one sentence.",
  "IMPORTANT: Return ONLY the analysis, no quotes, no JSON, no extra text.",
  "Just the analysis. Return in the English language.",
].join(" ");

export const translateText = async <T>(
  input: T,
  language: string
): Promise<T> => {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3:8b",
      messages: [
        {
          role: "system",
          content: isString(input)
            ? OLLAMA_SYSTEM_PROMPT_STRING
            : OLLAMA_SYSTEM_PROMPT_OBJECT,
        },
        {
          role: "user",
          content: isString(input)
            ? `Target language: ${language}\nText to translate: ${input}`
            : `Target language: ${language}\nJSON to translate (return JSON only, same structure):\n${JSON.stringify(
                input
              )}`,
        },
      ],
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
};

export const analyzeChart = async (
  data: {
    label: string;
    percentage: number;
    color: string;
  }[]
): Promise<string> => {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3:8b",
      messages: [
        {
          role: "system",
          content: OLLAMA_SYSTEM_PROMPT_ANALYSIS,
        },
        {
          role: "user",
          content: `Data to analyze: ${JSON.stringify(data)}`,
        },
      ],
      stream: false,
      options: { temperature: 0, num_ctx: 2048, num_predict: 2048 },
      keep_alive: "15m",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const responseJson = await response.json();
  const content = responseJson.message.content;

  return isString(content) ? content : "Failed to analyze chart";
};
