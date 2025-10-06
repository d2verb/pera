import { assertEquals, assertMatch } from "@std/assert";

Deno.test("cli new generates tsx file", async () => {
  const cliPath = new URL("../src/cli.ts", import.meta.url).href;
  const dir = await Deno.makeTempDir();
  const p = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", cliPath, "new", "test.tsx"],
    cwd: dir,
  }).spawn();

  const { code } = await p.status;
  assertEquals(code, 0);

  const content = await Deno.readTextFile(`${dir}/test.tsx`);

  // Test a part of the generated file.
  assertMatch(content, /^\/\*\* @jsxImportSource/);
  assertMatch(
    content,
    /import { serve } from "https:\/\/esm\.sh\/jsr\/@d2verb\/pera/,
  );
  assertMatch(content, /await serve/);
});
