import { assertEquals, assertMatch } from "@std/assert";
import { fileExists } from "../src/utils.ts";

const DEFAULT_FILENAME = "app.tsx";

async function runNewCommand(
  dir: string,
  yn: "y" | "n" = "y",
  filename?: string,
): Promise<Deno.ChildProcess> {
  const cliPath = new URL("../src/cli.ts", import.meta.url).href;
  const p = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", cliPath, "new", ...(filename ? [filename] : [])],
    cwd: dir,
    stdin: "piped",
  }).spawn();
  const writer = p.stdin.getWriter();
  await writer.write(new TextEncoder().encode(`${yn}\n`));
  await writer.close();
  return p;
}

function checkGeneratedFileContent(content: string) {
  assertMatch(content, /^\/\*\* @jsxImportSource/);
  assertMatch(
    content,
    /import { serve } from "https:\/\/esm\.sh\/jsr\/@d2verb\/pera/,
  );
  assertMatch(content, /await serve/);
}

Deno.test("[cli] new generates tsx file (default filename)", async () => {
  const dir = await Deno.makeTempDir();
  const p = await runNewCommand(dir, "y");

  const { code } = await p.status;
  assertEquals(code, 0);

  const content = await Deno.readTextFile(`${dir}/${DEFAULT_FILENAME}`);

  // Test a part of the generated file.
  checkGeneratedFileContent(content);
});

Deno.test("[cli] new generates tsx file", async () => {
  const dir = await Deno.makeTempDir();
  const p = await runNewCommand(dir, "y", "test.tsx");

  const { code } = await p.status;
  assertEquals(code, 0);

  const content = await Deno.readTextFile(`${dir}/test.tsx`);

  // Test a part of the generated file.
  checkGeneratedFileContent(content);
});

Deno.test("[cli] new fails if file already exists", async () => {
  const dir = await Deno.makeTempDir();
  const filename = "test.tsx";
  const filePath = `${dir}/${filename}`;
  const expectedContent = "THIS CANT BE OVERWRITTEN";
  await Deno.writeTextFile(filePath, expectedContent);

  const p = await runNewCommand(dir, "y", filename);

  // Execution failed
  const { code } = await p.status;
  assertEquals(code, 1);

  // The file is not overwritten
  const content = await Deno.readTextFile(filePath);
  assertEquals(content, expectedContent);
});

Deno.test("[cli] new fails if user doesn't confirm", async () => {
  const dir = await Deno.makeTempDir();
  const p = await runNewCommand(dir, "n");

  // Execution failed
  const { code } = await p.status;
  assertEquals(code, 1);

  // No file is created
  const filePath = `${dir}/${DEFAULT_FILENAME}`;
  assertEquals(await fileExists(filePath), false);
});
