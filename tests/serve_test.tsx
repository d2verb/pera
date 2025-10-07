import { assertEquals, assertMatch } from "@std/assert";
import { delay } from "@std/async";
import { serve } from "../src/mod.ts";

const App = () => {
  return <div>Hello, World!</div>;
};

const port: number = 9090;
let finished: Promise<void>;
let controller: AbortController;

Deno.test.beforeEach(async () => {
  controller = new AbortController();
  finished = serve(App, {
    port,
    title: "Test Server",
    moduleUrl: import.meta.url,
    props: { initial: 7 },
    api: (app) => {
      app.get(
        "/users/:name",
        (c) => new Response(`Hello, ${c.req.param("name")}!`),
      );
    },
    signal: controller.signal,
  });
  await delay(100);
});

Deno.test.afterEach(async () => {
  controller.abort();
  await finished;
});

Deno.test("serve() responds to GET /", async () => {
  const resRoot = await fetch(`http://localhost:${port}`);
  const html = await resRoot.text();
  assertEquals(resRoot.status, 200);
  assertMatch(html, /<title>Test Server<\/title>/);
  assertMatch(html, /<div>Hello, World!<\/div>/);
});

Deno.test("serve() responds to GET /_pera/api/*", async () => {
  const resApi = await fetch(`http://localhost:${port}/_pera/api/users/deno`);
  assertEquals(resApi.status, 200);
  assertEquals(await resApi.text(), "Hello, deno!");

  const resApiNotFound = await fetch(
    `http://localhost:${port}/_pera/api/not-found`,
  );
  assertEquals(resApiNotFound.status, 404);
  await resApiNotFound.text();

  const resApiMethodNotAllowed = await fetch(
    `http://localhost:${port}/_pera/api/users/deno`,
    { method: "POST" },
  );
  assertEquals(resApiMethodNotAllowed.status, 404);
  await resApiMethodNotAllowed.text();
});

Deno.test("serve() responds to GET /_pera/hmr", async () => {
  const resHmr = await fetch(`http://localhost:${port}/_pera/hmr`);
  assertEquals(resHmr.status, 200);
  assertEquals(resHmr.headers.get("content-type"), "text/event-stream");
  const reader = resHmr.body!.getReader();
  const decoder = new TextDecoder();
  const { value } = await reader.read();
  assertEquals(decoder.decode(value), "retry: 2000\n\n");
  // TODO(d2verb): Check the hot-reload event
  await reader.cancel();
});

Deno.test("serve() responds to GET /_pera/app.js", async () => {
  // TODO(d2verb): Implement this test
});
