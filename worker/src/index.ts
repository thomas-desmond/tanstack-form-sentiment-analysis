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

interface SentimentResult {
	label: string;
	score: number;
}

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
			console.log(`Name: ${name}, Feedback: ${feedback}`); // Handle the data as needed

			const sentiment = await getSentimentScoreWithWorkersAI(env, feedback);
			console.log(sentiment);
			await env.KV.put(name, JSON.stringify(sentiment));

			return new Response(JSON.stringify({ message: 'Data received', sentiment }), {
				headers: corsHeaders,
			});
		}

		// if (request.method === 'GET' && url.pathname === '/recent') {
		// 	const keys = await env.KV.list();
		// 	const values = await Promise.all(
		// 		keys.keys.map(async (key) => {
		// 			const value = await env.KV.get(key.name);
		// 			return { key: key.name, value: value ? JSON.parse(value) : null };
		// 		})
		// 	);
		// 	console.log("KV: ", values);
		// 	return new Response(JSON.stringify(values), {
		// 		headers: corsHeaders,
		// 	});
		// }

		return new Response(JSON.stringify('Hello World'), {
			headers: corsHeaders,
		});
	},
} satisfies ExportedHandler<Env>;

async function getSentimentScoreWithWorkersAI(env: Env, feedback: string) {
	const response = await env.AI.run('@cf/huggingface/distilbert-sst-2-int8', {
		text: feedback,
	});

	const sentimentResult = response.reduce((prev, current) => {
		return (prev as SentimentResult).score > (current as SentimentResult).score ? prev : current;
	});

	const sentiment = {
		label: sentimentResult.label,
		score: sentimentResult.score,
	};
	return sentiment;
}

function getCorsHeaders() {
	return {
		'Access-Control-Allow-Headers': '*',
		'Access-Control-Allow-Methods': 'POST',
		'Access-Control-Allow-Origin': '*',
	};
}

function handleOptionsRequest(request: Request, corsHeaders: HeadersInit): boolean {
	if (request.method === 'OPTIONS') {
		return true;
	}
	return false;
}
