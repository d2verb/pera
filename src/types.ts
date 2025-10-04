import type { ApiMap } from "./api.ts";

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