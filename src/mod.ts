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
 * ```ts
 * await serve(App, {
 *   port: 8080,
 *   moduleUrl: import.meta.url,
 *   api: {
 *     // The actual path is `/_pera/api/students/:name`
 *     "/students/:name": {
 *       GET: (_, ctx) => new Response(`Hello, ${ctx.params.name}!`),
 *     },
 *   },
 * });
 * ```
 *
 * @param opts The options for the Pera app.
 */
export async function serve<P extends Record<string, unknown>>(
  App: PeraApp<P>,
  opts: PeraOptions<P>,
): Promise<void> {
  if (typeof Deno === "undefined") return;

  const { serveImpl } = await import("./server.ts");
  return serveImpl(App, opts);
}

export type {
  ApiContext,
  ApiFn,
  ApiMap,
  ApiMethod,
  ApiMethodMap,
} from "./api.ts";
export type { PeraOptions };
