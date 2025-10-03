import type { JSX } from "preact";

export type PeraOptions = {
  port?: number;
  title?: string;
  // deno-lint-ignore no-explicit-any
  props?: Record<string, any>;
  moduleUrl: string;
  rootId?: string;
  hmr?: boolean;
}

// deno-lint-ignore no-explicit-any
export type PeraApp = (props: Record<string, any>) => JSX.Element;