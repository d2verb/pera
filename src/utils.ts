export function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("`", "&#96;");
}

export function filePathFromModuleUrl(moduleUrl: string): string {
  const u = new URL(moduleUrl);
  if (u.protocol !== "file:") {
    throw new Error(`Invalid module URL: ${moduleUrl}`);
  }
  return u.pathname;
}