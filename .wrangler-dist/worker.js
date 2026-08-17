// src/worker.ts
var worker_default = {
  async fetch(request, env, ctx) {
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        const url = new URL(request.url);
        url.pathname = "/index.html";
        return env.ASSETS.fetch(new Request(url, request));
      }
      return response;
    } catch (e) {
      return new Response("Internal Error loading assets", { status: 500 });
    }
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
