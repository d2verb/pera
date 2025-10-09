import { assertEquals, assertThrows } from "@std/assert";
import {
  escapeHtml,
  fileExists,
  filePathFromModuleUrl,
  isProduction,
} from "../src/utils.ts";

Deno.test("escapeHtml escapes HTML characters", () => {
  assertEquals(escapeHtml("Hello & World"), "Hello &amp; World");
  assertEquals(
    escapeHtml("<script>alert('xss')</script>"),
    "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;",
  );
  assertEquals(escapeHtml('He said "Hello"'), "He said &quot;Hello&quot;");
  assertEquals(escapeHtml("`code`"), "&#96;code&#96;");
  assertEquals(escapeHtml(""), "");
  assertEquals(escapeHtml("No special chars"), "No special chars");
});

Deno.test("filePathFromModuleUrl extracts file path from file URL", () => {
  const fileUrl = "file:///home/user/test.ts";
  const result = filePathFromModuleUrl(fileUrl);
  assertEquals(result, "/home/user/test.ts");
});

Deno.test("filePathFromModuleUrl throws error for non-file URLs", () => {
  assertThrows(
    () => filePathFromModuleUrl("https://example.com/test.ts"),
    Error,
    "Invalid module URL: https://example.com/test.ts",
  );

  assertThrows(
    () => filePathFromModuleUrl("http://example.com/test.ts"),
    Error,
    "Invalid module URL: http://example.com/test.ts",
  );
});

Deno.test("isProduction returns true in production", () => {
  assertEquals(isProduction(), false);

  Deno.env.set("NODE_ENV", "production");
  assertEquals(isProduction(), true);
  Deno.env.delete("NODE_ENV");

  Deno.env.set("DENO_ENV", "production");
  assertEquals(isProduction(), true);
  Deno.env.delete("DENO_ENV");

  Deno.env.set("DENO_DEPLOY", "1");
  assertEquals(isProduction(), true);
  Deno.env.delete("DENO_DEPLOY");
});

Deno.test("fileExists returns true if file exists", async () => {
  const dir = await Deno.makeTempDir();
  const filePath = `${dir}/test.txt`;
  await Deno.writeTextFile(filePath, "test");
  assertEquals(await fileExists(filePath), true);
});

Deno.test("fileExists returns false if file does not exist", async () => {
  const dir = await Deno.makeTempDir();
  const filePath = `${dir}/test.txt`;
  assertEquals(await fileExists(filePath), false);
});
