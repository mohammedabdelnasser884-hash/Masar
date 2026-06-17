// ─── Groq AI Client (مجاني ١٠٠٪ على free tier) ─────────────────
// يستخدم llama-3.3-70b - نفس جودة GPT-4 تقريباً ومجاني

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function groqChat(
  messages: GroqMessage[],
  jsonMode = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_GROQ_KEY") {
    throw new Error("GROQ_API_KEY غير موجود في ملف .env");
  }

  const body: any = {
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 1500,
    temperature: 0.4,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API Error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
