import OpenAI from "openai";

const openai = new OpenAI({ apiKey: import.meta.env.OPENAI_API_KEY });

export async function POST({ request }) {
  const { message } = await request.json();

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful real estate assistant." },
      { role: "user", content: message },
    ],
  });

  return new Response(
    JSON.stringify({ reply: chatCompletion.choices[0].message.content }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
