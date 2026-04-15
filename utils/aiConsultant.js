// utils/aiConsultant.js
// ✅ UPDATED: Now using Poe API (OpenAI-compatible) with Gemini-3.1-Flash-Lite
// Much simpler & cheaper than Firebase Vertex AI

import Constants from "expo-constants";
import OpenAI from "openai";
const apiKey = Constants.expoConfig.extra.poeApiKey;

const client = new OpenAI({
  apiKey: "sk-poe-yraTMUMpKFCpK3CmY98RsXOQANpchAI03Ws-t22gK1I", // ← Put your Poe API key here
  baseURL: "https://api.poe.com/v1",
  dangerouslyAllowBrowser: true, // Required for React Native / Expo
});

export const AIConsultant = {
  getCoachAdvice: async (history, exercise, unit) => {
    try {
      const prompt = `你是一位專業健身教練。
歷史數據: ${JSON.stringify(history.slice(0, 3))}
當前動作: ${exercise}
單位: ${unit}

請根據歷史表現，建議下一次最適合的重量和次數。
請**只回傳**以下格式的 JSON，不要有任何額外文字、說明或 markdown：

{"message": "鼓勵的話", "suggestedWeight": 數字, "suggestedReps": 數字}`;

      const chat = await client.chat.completions.create({
        model: "gemini-3.1-flash-lite",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // 讓回答更穩定
        response_format: { type: "json_object" }, // 強制 JSON 輸出
      });

      const text = chat.choices[0].message.content.trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("Poe API Error:", error);
      return null;
    }
  },
};
