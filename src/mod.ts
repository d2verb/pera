/**
 * A lightweight library for running Preact applications without bundling.
 * Provides a simple server function to serve TSX files with hot module replacement
 * and built-in API endpoint support.
 * 
 * @module
 */

export * from "./server.ts";
export type { ApiMap, ApiMethodMap, ApiMethod, ApiFn, ApiContext } from "./api.ts";