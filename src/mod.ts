import { escapeHtml, filePathFromModuleUrl } from "./utils.ts";
import { transpile } from "@deno/emit";

export type PeraOptions = {
  port?: number;
  title?: string;
  // deno-lint-ignore no-explicit-any
  props?: Record<string, any>;
  moduleUrl: string;
  rootId?: string;
  hmr?: boolean;
}

export function serve(opts: PeraOptions) {
  const port = opts.port ?? 8080;
  const title = opts.title ?? "Pera App";
  const rootId = opts.rootId ?? "root";
  const appFile = filePathFromModuleUrl(opts.moduleUrl);
  const hmr = opts.hmr ?? true;

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
        return new Response(`// read error: ${e instanceof Error ? e.message : "unknown error"}`, {
          status: 500,
          headers: { "content-type": "application/javascript; charset=utf-8" },
        });
      }
    }

    if (url.pathname === "/_pera/hmr") {
      const stream = new ReadableStream({
        async start(controller) {
          const enc = new TextEncoder();
          controller.enqueue(enc.encode("retry: 2000\n\n"));

          for await (const ev of Deno.watchFs(appFile)) {
            if (ev.kind === "modify") {
              controller.enqueue(enc.encode(`event: hot-reload\ndata: hot-reload\n\n`));
            }
          }
        },
      });
      return new Response(stream, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
          "connection": "keep-alive",
        }
      });
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
          <script>window.__PERA_PROPS__ = ${JSON.stringify(opts.props ?? {})}</script>
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