export type ApiMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

export type ApiContext = {
  params: Record<string, string | undefined>;
};

export type ApiFn = (
  req: Request,
  ctx: ApiContext,
) => Response | Promise<Response>;

export type ApiMethodMap = Partial<Record<ApiMethod, ApiFn>>;

export type ApiMap = Record<string, ApiMethodMap>;

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
