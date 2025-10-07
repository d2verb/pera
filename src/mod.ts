import type { PeraApp, PeraOptions } from "./types.ts";

/**
 * Serve the Pera app. serve() implicitly treats a component named App as
 * the root component. Therefore, you must define a component named App.
 *
 * @example Basic Example
 * ```ts
 * await serve(App, {
 *   port: 8080,
 *   moduleUrl: import.meta.url, // This is required
 * });
 * ```
 *
 * @example With API
 * `app` is a Hono app instance. You can use it to define your API endpoints.
 * ```ts
 * await serve(App, {
 *   port: 8080,
 *   moduleUrl: import.meta.url,
 *   api: (app) => {
 *     // The actual path is `/_pera/api/students/:name`
 *     app.get("/students/:name", (c) =>
 *       new Response(`Hello, ${c.req.param("name")}!`),
 *     );
 *   },
 * });
 * ```
 *
 * @param App The root component of the Pera app.
 * @param opts The options for the Pera app.
 */
export async function serve<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  App: PeraApp<P>,
  opts: PeraOptions<P>,
): Promise<void> {
  if (typeof Deno === "undefined") return;

  const { serveImpl } = await import("./server.ts");
  return serveImpl(App, opts);
}

export type { PeraOptions };
