import { escapeHtml, filePathFromModuleUrl } from "./utils.ts";
import type { PeraApp, PeraOptions } from "./types.ts";
import { bundle } from "@deno/emit";
import { dirname } from "@std/path";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";

/**
 * The implementation of the serve() function.
 *
 * @param App The root component of the Pera app.
 * @param opts The options for the Pera app.
 */
export async function serveImpl<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  App: PeraApp<P>,
  opts: PeraOptions<P>,
) {
  const port = opts.port ?? 8080;
  const title = opts.title ?? "Pera App";
  const rootId = opts.rootId ?? "root";
  const appFile = filePathFromModuleUrl(opts.moduleUrl);
  const hmr = opts.hmr ?? true;
  const logging = opts.logging ?? false;

  const app = new Hono();

  if (logging) {
    app.use(logger());
  }

  app.get("/_pera/app.js", async () => {
    try {
      const origCode = await Deno.readTextFile(appFile);
      const autoExports =
        '\n\nexport { h, hydrate } from "https://esm.sh/preact@10.27.2";\n';
      const codeToBundle = origCode + autoExports;

      const tempFile = await Deno.makeTempFile({
        dir: dirname(appFile),
        prefix: ".pera-temp-app-",
        suffix: ".tsx",
      });

      try {
        await Deno.writeTextFile(tempFile, codeToBundle);
        const url = new URL("file://" + tempFile);
        const result = await bundle(url);
        return new Response(result.code, {
          headers: {
            "content-type": "application/javascript; charset=utf-8",
          },
        });
      } finally {
        await Deno.remove(tempFile);
      }
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
  });

  app.get("/_pera/hmr", () => {
    let watcher: Deno.FsWatcher | undefined;
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode("retry: 2000\n\n"));
        watcher = Deno.watchFs(appFile);
        for await (const ev of watcher) {
          if (ev.kind === "modify") {
            controller.enqueue(
              enc.encode(`event: hot-reload\ndata: hot-reload\n\n`),
            );
          }
        }
      },
      cancel() {
        watcher?.close();
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "connection": "keep-alive",
      },
    });
  });

  app.get("/", () => {
    const ssr = renderToString(h(App, opts.props ?? null));
    const propsStr = JSON.stringify(opts.props ?? {});
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
          <div id="${rootId}">${ssr}</div>
          <script type="module">
            import { App, h, hydrate } from "/_pera/app.js";
            const el = document.getElementById("${rootId}");
            hydrate(h(App, ${propsStr}), el);
            if (${hmr}) {
              const es = new EventSource("/_pera/hmr");
              es.addEventListener("hot-reload", () => {
                console.info("[HMR] reloading...");
                location.reload();
              });
            }
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });

  if (opts.api) {
    const apiRouter = new Hono();
    await opts.api(apiRouter);
    app.route("/_pera/api", apiRouter);
  }

  const server = Deno.serve({ port, signal: opts.signal }, app.fetch);

  return server.finished;
}
