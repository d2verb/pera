import type { JSX } from "preact";
import type { Hono } from "@hono/hono";

/**
 * The options for the Pera app.
 */
export type PeraOptions<
  P extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** The port to listen on. (Default: 8080) */
  port?: number;
  /** The title of the app. This value will be used as the title of the HTML document. (Default: "Pera App") */
  title?: string;
  /** The props to pass to the App component. (Default: {}) */
  props?: P;
  /** The URL of the module to import the App component from. */
  moduleUrl: string;
  /** The ID of the root element to render the App component into. (Default: "root") */
  rootId?: string;
  /** Whether to enable hot module replacement. (Default: true) */
  hmr?: boolean;
  /** The function to register the API endpoints. (Default: undefined) */
  api?: (app: Hono) => void | Promise<void>;
  /** The signal to abort the server. (Default: undefined) */
  signal?: AbortSignal;
};

export type PeraApp<
  P extends Record<string, unknown> = Record<string, unknown>,
> = (
  props: P,
) => JSX.Element;
