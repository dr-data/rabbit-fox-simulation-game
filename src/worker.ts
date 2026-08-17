export default {
  async fetch(request, env, ctx) {
    // Attempt to fetch the static asset. If it fails, fallback to index.html for SPA routing.
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // SPA fallback
        const url = new URL(request.url);
        url.pathname = '/index.html';
        return env.ASSETS.fetch(new Request(url, request));
      }
      return response;
    } catch (e) {
      return new Response("Internal Error loading assets", { status: 500 });
    }
  },
};
