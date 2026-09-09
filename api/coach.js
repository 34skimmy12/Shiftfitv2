export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI Gateway API key is not configured on the server." });
  }

  try {
    const { context, history = [], message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message is required." });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
          .slice(-20)
          .map((item) => ({ role: item.role, content: item.content.slice(0, 4000) }))
      : [];

    const instructions = `You are ShiftFit, a practical AI fitness, nutrition and recovery coach specialised in shift workers.

${context || "No additional ShiftFit context was provided."}

Coach rules:
- Tailor advice to the user's actual shift, goals, targets and current ShiftFit plan when available.
- Be practical, concise and motivating. Prefer short paragraphs and useful bullet points.
- Never pretend you completed an action inside ShiftFit unless the app explicitly confirms it.
- Do not diagnose medical conditions. For urgent or concerning symptoms, advise the user to seek appropriate medical care.
- When discussing training, account for fatigue and recovery from long/night shifts.
- When discussing nutrition, work with the user's stated calorie/protein targets and actual meals where available.
- If important information is missing, ask a focused follow-up question rather than inventing it.`;

    const response = await fetch("https://ai-gateway.vercel.sh/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5.4-mini",
        instructions,
        input: [
          ...safeHistory,
          { role: "user", content: message.slice(0, 6000) },
        ],
        max_output_tokens: 700,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("AI Gateway Coach error", data);
      return res.status(502).json({ error: "The AI coach could not respond right now." });
    }

    const reply = data.output_text || data.output?.flatMap((item) => item.content || []).find((part) => part.type === "output_text")?.text;
    if (!reply) {
      return res.status(502).json({ error: "The AI coach returned an empty response." });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Coach API error", error);
    return res.status(500).json({ error: "Unable to reach the AI coach." });
  }
}
