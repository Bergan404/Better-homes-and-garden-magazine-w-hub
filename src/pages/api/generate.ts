export const prerender = false;

import type { APIRoute } from 'astro';
// console.log("Loaded API Key:", import.meta.env.OPENAI_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { promptType, userInput } = body;

    if (!promptType || !userInput) {
      return new Response(
        JSON.stringify({ error: 'Missing promptType or userInput in request body.' }),
        { status: 400 }
      );
    }

    const promptMap: Record<string, string> = {
      listing: `You are a real estate copywriter. Write a compelling, emotionally appealing property listing description. Make it persuasive and include highlights that would attract potential buyers. Based on the details below:`,

      instagram: `You're writing a short, punchy Instagram caption for a real estate post. Keep it engaging, friendly, and include relevant emojis if appropriate. Use a hook at the beginning to catch attention. The post is about:`,

      followup: `You are a real estate agent following up with a lead. Write a friendly and professional follow-up message via email or text that encourages them to take the next step. Use the context below:`,

      objections: `You are a real estate agent responding to a client's objection. Write a calm, understanding, and persuasive response that acknowledges the concern while building trust. The objection is:`,

      coaching: `You're a seasoned real estate coach mentoring an agent. Offer practical, motivational advice based on the following challenge or question. Keep it concise and actionable. The topic is:`
    };

    const basePrompt = promptMap[promptType];

    if (!basePrompt) {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt type provided.' }),
        { status: 400 }
      );
    }

    const finalPrompt = `${basePrompt}${userInput}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: 'user', content: finalPrompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    // console.log('OpenAI response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(JSON.stringify({ error: data.error?.message || 'OpenAI API error' }), {
        status: response.status,
      });
    }

    return new Response(
      JSON.stringify({
        result: data.choices?.[0]?.message?.content?.trim() || 'No output.',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Error processing request.' }), {
      status: 500,
    });
  }
};
