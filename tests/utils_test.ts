import { assertEquals, assertThrows } from "@std/assert";
import { escapeHtml, filePathFromModuleUrl } from "../src/utils.ts";

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
