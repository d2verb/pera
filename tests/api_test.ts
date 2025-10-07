import { defineApi } from "../src/api.ts";
import type { AssertTrue, IsExact } from "@std/testing/types";

Deno.test("defineApi() infers the correct type", () => {
  defineApi({
    "/users/:name/items/:itemId": {
      GET: (_, ctx) => {
        type _ = AssertTrue<
          IsExact<typeof ctx.params, { name: string; itemId: string }>
        >;
        return new Response("DUMMY");
      },
    },
    "/users": {
      GET: (_, ctx) => {
        type _ = AssertTrue<IsExact<typeof ctx.params, Record<string, never>>>;
        return new Response("DUMMY");
      },
    },
    "/users/:name/:name": {
      GET: (_, ctx) => {
        type _ = AssertTrue<IsExact<typeof ctx.params, never>>;
        return new Response("DUMMY");
      },
    },
    "/users/:/test": {
      GET: (_, ctx) => {
        type _ = AssertTrue<IsExact<typeof ctx.params, never>>;
        return new Response("DUMMY");
      },
    },
    "": {
      GET: (_, ctx) => {
        type _ = AssertTrue<IsExact<typeof ctx.params, never>>;
        return new Response("DUMMY");
      },
    },
  });
});
