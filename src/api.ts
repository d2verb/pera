/**
 * The HTTP methods that are supported by the API.
 */
export type ApiMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

/**
 * Prettify a type.
 *
 * @example
 * ```ts
 * Prettify<{ a: string } & { b: number }> = { a: string; b: number }
 * ```
 */
type Prettify<T> =
  & {
    [K in keyof T]: T[K];
  }
  // deno-lint-ignore ban-types
  & {};

/**
 * Extract path parameters from a URL pattern.
 *
 * @example
 * ```ts
 * PathParams<"/users/:id/posts/:postId"> = { id: string; postId: string }
 * ```
 */
export type PathParams<Path extends string> = Prettify<
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & PathParams<`/${Rest}`>
    : Path extends `${infer _Start}:${infer Param}` ? { [K in Param]: string }
    : Record<string, never>
>;

/**
 * The context for the API function.
 */
export type ApiContext<
  T extends Record<string, string> = Record<string, string>,
> = {
  /** The path parameters parsed from the URL. */
  params: T;
};

/**
 * The function signature for the API function.
 */
export type ApiFn<T extends Record<string, string> = Record<string, string>> = (
  req: Request,
  ctx: ApiContext<T>,
) => Response | Promise<Response>;

/**
 * The map of the API methods to the API functions.
 */
export type ApiMethodMap<
  T extends Record<string, string> = Record<string, string>,
> = Partial<Record<ApiMethod, ApiFn<T>>>;

/**
 * The map of the API endpoints to the API methods.
 */
export type ApiMap<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  [K in keyof T & string]: ApiMethodMap<PathParams<K>>;
};

/**
 * Type inference for the API map.
 */
export function defineApi<T extends Record<string, unknown>>(
  routes: ApiMap<T>,
): ApiMap<T> {
  return routes;
}

/**
 * Find the API method map and the API parameters for the given path.
 */
export function findEndpoint<
  T extends Record<string, unknown> = Record<string, unknown>,
>(path: string, api: ApiMap<T>) {
  for (const [endpoint, methodMap] of Object.entries(api)) {
    const matched = new URLPattern({ pathname: endpoint }).exec({
      pathname: path,
    });
    if (!matched) continue;

    return {
      methodMap,
      params: matched.pathname.groups,
    };
  }
  return null;
}
