// Returns the URL only when it's an http(s) link; otherwise "#".
// Prevents javascript:/data: URI XSS when rendering user-supplied links as href/window.open.
export function safeUrl(url?: string | null): string {
  return url && /^https?:\/\//i.test(url) ? url : "#";
}
