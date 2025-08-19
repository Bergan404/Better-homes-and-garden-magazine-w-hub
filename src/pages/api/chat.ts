export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    // Homes sold question
    function isHomesSoldQuestion(message: string) {
      return /homes sold|how many homes sold|recently sold homes/i.test(message);
    }
    function extractCity(message: string) {
      const match = message.match(/in ([a-z\s]+)/i);
      if (!match) return null;
      return match[1].trim().toLowerCase().replace(/\s+/g, "_"); // e.g., "fort lauderdale" → "fort_lauderdale"
    }
    async function fetchHomesSoldData(citySlug: string) {
      try {
        const res = await fetch(`https://api.oudsdev.com/bhgre/json/homes_sold/${citySlug}.json`);
        if (!res.ok) return null;
        const data = await res.json();
        return data; // Could include total homes sold, dates, etc.
      } catch {
        return null;
      }
    }
    let dataString = "";
    if (isHomesSoldQuestion(message)) {
      const citySlug = extractCity(message); // e.g., "fort_lauderdale"
      if (citySlug) {
        const cityData = await fetchHomesSoldData(citySlug);
        if (cityData && cityData.length > 0) {
          dataString = `Data for ${cityData[0]["region"]}:\n- Homes sold in the past 30 days: ${cityData[0]["homes sold"]}`;
        } else {
          dataString = "No homes sold data available for this city.";
        }
      }
    }
    // Homes sold question END

    const messages = [
      {
        role: "system",
        content: `
        You are a professional real estate assistant working for Better Homes and Gardens Real Estate.
        Always provide answers focused on real estate topics.
        Use clear explanations, formatting (headers, bold, lists) where appropriate.
        Do not answer questions unrelated to real estate.
        If you do not know the answer, respond: "I don’t have that information."
        `
      },
      { role: "user", content: dataString ? `${dataString}\n\nUser question: ${message}` : message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return new Response(JSON.stringify({ error: data.error?.message || "API Error" }), {
        status: response.status,
      });
    }

    return new Response(JSON.stringify({ reply: data.choices?.[0]?.message?.content?.trim() }), {
      status: 200,
    });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
