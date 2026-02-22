import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey
  ? new OpenAI({ apiKey })
  : (null as unknown as OpenAI);

export function isOpenAIConfigured(): boolean {
  return Boolean(apiKey);
}
