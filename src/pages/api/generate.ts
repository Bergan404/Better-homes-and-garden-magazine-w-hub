export const prerender = false;

import type { APIRoute } from 'astro';
console.log("Loaded API Key:", import.meta.env.OPENAI_API_KEY);

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
      listing: 'Generate a compelling real estate listing description based on: ',
      instagram: 'Write an Instagram caption for this property or theme: ',
      followup: 'Write a lead follow-up message with this info: ',
      objections: 'Respond to this client objection: ',
      coaching: 'Give real estate coaching advice on: ',
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
        model: "gpt-4.1",
        messages: [{ role: 'user', content: finalPrompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));

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
