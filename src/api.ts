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
 * PathParams<"/users"> = Record<string, never>
 * PathParams<"/users/:name/:name"> = never
 * PathParams<""> = never
 * ```
 */
export type PathParams<Path extends string, Seen extends string = never> =
  Prettify<
    Path extends "" ? never
    : Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param extends "" ? never
    : Param extends Seen ? never
    : { [K in Param]: string } & PathParams<`/${Rest}`, Param | Seen>
    : Path extends `${infer _Start}:${infer Param}` ? Param extends "" ? never
    : Param extends Seen ? never
    : { [K in Param]: string }
    : Record<string, never>
  >;

/**
 * The context for the API function.
 */
export type ApiContext<
  Params extends Record<string, string>,
> = {
  /** The path parameters parsed from the URL. */
  params: Params;
};

/**
 * The function signature for the API function.
 */
export type ApiFn<
  Params extends Record<string, string>,
> = (
  req: Request,
  ctx: ApiContext<Params>,
) => Response | Promise<Response>;

/**
 * The map of the API methods to the API functions.
 */
export type ApiMethodMap<
  Params extends Record<string, string>,
> = Partial<Record<ApiMethod, ApiFn<Params>>>;

/**
 * The map of the API endpoints to the API methods.
 */
export type ApiMap<
  T extends Record<string, unknown>,
> = {
    [K in keyof T & string]: ApiMethodMap<PathParams<K>>;
  };

/**
 * Type inference for the API map.
 * 
 * TODO(d2verb): I want to trigger a type error if the path is invalid, but I don't know how to do it.
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
