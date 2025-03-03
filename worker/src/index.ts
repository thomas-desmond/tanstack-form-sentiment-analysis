/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const corsHeaders = getCorsHeaders();
		if (handleOptionsRequest(request, corsHeaders)) {
			return new Response('OK', {
				headers: corsHeaders,
			});
		}

		const url = new URL(request.url);

		if (request.method === 'POST' && url.pathname === '/submit') {
			const data = await request.json();
			const { name, feedback } = data as { name: string; feedback: string };
			console.log(`Feedback: ${feedback}`); // Handle the data as needed

			const sentiment = await getSentimentScoreWithWorkersAI(env, feedback, name);
			console.log(sentiment);

			return new Response(JSON.stringify({sentiment}), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		return new Response(JSON.stringify('Request did not match any paths in Cloudflare Worker'), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	},
} satisfies ExportedHandler<Env>;

async function getSentimentScoreWithWorkersAI(env: Env, feedback: string, name: string) {
    const messages = [
		{ role: "system", content: `You are a friendly assistant that analyzes the sentiment of given text. Respond with a fun message saying if the text is positive or negative to the user ${name}` },
		{
		  role: "user",
		  content: feedback,
		},
	  ];

	  const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", { messages });


	console.log(response)

	return response;
}

function getCorsHeaders() {
	return {
		'Access-Control-Allow-Headers': '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Origin': '*',
	};
}

function handleOptionsRequest(request: Request, corsHeaders: HeadersInit): boolean {
	if (request.method === 'OPTIONS') {
		return true;
	}
	return false;
}
