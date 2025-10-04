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
 * The context for the API function.
 */
export type ApiContext = {
  /** The path parameters parsed from the URL. */
  params: Record<string, string | undefined>;
};

/**
 * The function signature for the API function.
 */
export type ApiFn = (
  req: Request,
  ctx: ApiContext,
) => Response | Promise<Response>;

/**
 * The map of the API methods to the API functions.
 */
export type ApiMethodMap = Partial<Record<ApiMethod, ApiFn>>;

/**
 * The map of the API endpoints to the API methods.
 */
export type ApiMap = Record<string, ApiMethodMap>;

/**
 * Find the API method map and the API parameters for the given path.
 */
export function findEndpoint(path: string, api: ApiMap) {
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
