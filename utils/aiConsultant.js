export const AIConsultant = {
  getCoachAdvice: async (history, exercise, unit) => {
    try {
      // 1. Stricter Prompt
      const prompt = `Task: Professional Fitness Coach. 
Output Requirement: STRICT JSON ONLY. No conversational text. No markdown.
Exercise: ${exercise}
Unit: ${unit}
History: ${JSON.stringify(history.slice(0, 3))}

Expected JSON structure:
{"message": "string", "suggestedWeight": number, "suggestedReps": number}`;

      const response = await fetch("https://api.poe.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer sk-poe-d-UIwVTNpuVWeeMLmUGWklqJHMw1BmrMJXLEHEVkLN4",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Or your preferred Poe model
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1, // Lower temperature makes the AI more consistent
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const rawText = data.choices[0].message.content.trim();

      // 2. SMART PARSING: Find the first '{' and last '}'
      // This ignores any "非常感謝" or other text the AI adds by mistake.
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error("No JSON found in response:", rawText);
        return null;
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Coach Advice Error:", error);
      return null;
    }
  },
};
