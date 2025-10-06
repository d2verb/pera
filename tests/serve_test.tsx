import { assertEquals, assertMatch } from "@std/assert";
import { delay } from "@std/async";
import { serve } from "../src/mod.ts";

const App = () => {
  return <div>Hello, World!</div>;
};

Deno.test("serve() starts and responds", async () => {
  const controller = new AbortController();
  const port = 9090;

  const finished = serve(App, {
    port,
    title: "Test Server",
    moduleUrl: import.meta.url,
    props: { initial: 7 },
    api: {
      "/users/:name": {
        GET: (_, ctx) => new Response(`Hello, ${ctx.params.name}!`),
      },
    },
    signal: controller.signal,
  });

  await delay(100);

  const resRoot = await fetch(`http://localhost:${port}`);
  const html = await resRoot.text();
  assertEquals(resRoot.status, 200);
  assertMatch(html, /<title>Test Server<\/title>/);
  assertMatch(html, /<div>Hello, World!<\/div>/);

  const resApi = await fetch(`http://localhost:${port}/_pera/api/users/deno`);
  assertEquals(resApi.status, 200);
  assertEquals(await resApi.text(), "Hello, deno!");

  controller.abort();
  await finished;
});
