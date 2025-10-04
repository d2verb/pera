import { type ApiMap, type ApiMethod, findEndpoint } from "./api.ts";
import { escapeHtml, filePathFromModuleUrl } from "./utils.ts";
import { transpile } from "@deno/emit";

/**
 * The options for the Pera app.
 */
export type PeraOptions = {
  /** The port to listen on. (Default: 8080) */
  port?: number;
  /** The title of the app. This value will be used as the title of the HTML document. (Default: "Pera App") */
  title?: string;
  /** The props to pass to the App component. (Default: {}) */
  // deno-lint-ignore no-explicit-any
  props?: Record<string, any>;
  /** The URL of the module to import the App component from. */
  moduleUrl: string;
  /** The ID of the root element to render the App component into. (Default: "root") */
  rootId?: string;
  /** Whether to enable hot module replacement. (Default: true) */
  hmr?: boolean;
  /** The API endpoints to expose to the client. (Default: {}) */
  api?: ApiMap;
};

/**
 * Serve the Pera app. serve() implicitly treats a component named App as
 * the root component. Therefore, you must define a component named App.
 * 
 * @example Basic Example
 * ```ts
 * // Make sure to import the serve function in the main module.
 * if (import.meta.main) {
 *   const { serve } = await import("jsr:@d2verb/pera");
 * 
 *   await serve({
 *     port: 8080,
 *     moduleUrl: import.meta.url,
 *   });
 * }
 * ```
 * 
 * @param opts The options for the Pera app.
 */
export function serve(opts: PeraOptions) {
  const port = opts.port ?? 8080;
  const title = opts.title ?? "Pera App";
  const rootId = opts.rootId ?? "root";
  const appFile = filePathFromModuleUrl(opts.moduleUrl);
  const hmr = opts.hmr ?? true;
  const api = opts.api ?? {};

  const handler = async (req: Request) => {
    const url = new URL(req.url);

    if (url.pathname === "/_pera/client.js") {
      const code = `
        import { h, render } from "https://esm.sh/preact@10";
        import { App } from "/_pera/app.js";
        const el = document.getElementById("${rootId}");
        const props = window.__PERA_PROPS__ ?? {};
        render(h(App, props), el);
        if (${hmr}) {
          const es = new EventSource("/_pera/hmr");
          es.addEventListener("hot-reload", () => {
            console.info("[HMR] reloading...");
            location.reload();
          });
        }
      `;
      return new Response(code, {
        headers: { "content-type": "application/javascript; charset=utf-8" },
      });
    }

    if (url.pathname === "/_pera/app.js") {
      try {
        // Transpile the app file from tsx to js
        const url = new URL("file://" + appFile);
        const result = await transpile(url);
        const code = result.get(url.href);
        return new Response(code, {
          headers: { "content-type": "application/javascript; charset=utf-8" },
        });
      } catch (e) {
        return new Response(
          `// read error: ${e instanceof Error ? e.message : "unknown error"}`,
          {
            status: 500,
            headers: {
              "content-type": "application/javascript; charset=utf-8",
            },
          },
        );
      }
    }

    if (url.pathname === "/_pera/hmr") {
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          controller.enqueue(enc.encode("retry: 2000\n\n"));

          for await (const ev of Deno.watchFs(appFile)) {
            if (ev.kind === "modify") {
              controller.enqueue(
                enc.encode(`event: hot-reload\ndata: hot-reload\n\n`),
              );
            }
          }
        },
      });
      return new Response(stream, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
          "connection": "keep-alive",
        },
      });
    }

    if (url.pathname.startsWith("/_pera/api/")) {
      const path = url.pathname.slice(10);
      const result = findEndpoint(path, api);
      if (!result) {
        return new Response("Endpoint not found", { status: 404 });
      }

      const { methodMap, params } = result;
      const method = req.method as ApiMethod;
      const fn = methodMap[method];
      if (!fn) {
        return new Response("Method not found", { status: 405 });
      }

      if (fn.length > 2) {
        return new Response("Invalid function signature", { status: 500 });
      }

      return await fn(req, { params });
    }

    const html = `
      <!doctype html>
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${escapeHtml(title)}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div id="${rootId}"></div>
          <script>window.__PERA_PROPS__ = ${JSON.stringify(opts.props ?? {})
      }</script>
          <script type="module" src="/_pera/client.js"></script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };

  Deno.serve({ port }, handler);
}
