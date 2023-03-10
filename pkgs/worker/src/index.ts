/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

const wikipediaUrlRegex = /https:\/\/.+\.wikipedia\.org\/.+/;

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const { pathname, searchParams } = new URL(request.url)
		switch (pathname) {
			case '/':
				return jsonResponse({
					hello: 'world',
				})
			case '/api/wikipedia':
				return await wikipedia(request, searchParams)
			default:
				return jsonResponse({
					error: 'not found',
				}, 404)
		}
	}
}

async function wikipedia(request: Request, searchParams: URLSearchParams) {
	/*
	const body = await request.text()
	let data: any
	try {
		data = JSON.parse(body)
	} catch (e) {
		return jsonResponse({
			error: `body is not a valid json: {e}`,
		}, 400)
	}
	*/
	const url = searchParams.get('url')
	if (!url) {
		return jsonResponse({
			error: 'url is required',
		}, 400)
	}
	if (!wikipediaUrlRegex.test(url)) {
		return jsonResponse({
			error: 'url is not a valid wikipedia page url',
		}, 400)
	}
	const init: RequestInit = {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
		}
	}

	const res = await fetch(url, init);
	const resBody = await res.text()
	if (!res.ok) {
		return newResponse(resBody, {
			status: 500
		})
	}

	return newResponse(resBody, {
		headers: {
			'Content-Type': 'text/html',
		}
	})
}

const defaultHeaders = {
	'Access-Control-Allow-Origin': '*',
}

const newResponse = (body: string, init: ResponseInit) => {
	init.headers = {...defaultHeaders, ...init.headers}
	return new Response(body, init)
}

const jsonResponse = (data: any, status: number = 200) => {
	return newResponse(JSON.stringify(data), {
		headers: {
			'Content-Type': 'application/json',
		},
		status,
	})
}
