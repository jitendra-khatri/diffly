import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [configSource, html, appSource] = await Promise.all([
  readFile(path.join(projectRoot, "vercel.json"), "utf8"),
  readFile(path.join(projectRoot, "index.html"), "utf8"),
  readFile(path.join(projectRoot, "src", "app.js"), "utf8"),
]);

const config = JSON.parse(configSource);
const globalHeaders = config.headers.find(({ source }) => source === "/(.*)")?.headers ?? [];
const headers = Object.fromEntries(globalHeaders.map(({ key, value }) => [key.toLowerCase(), value]));
const csp = headers["content-security-policy"] ?? "";

[
  "default-src 'none'",
  "connect-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self'",
  "style-src-attr 'none'",
].forEach((directive) => assert.ok(csp.includes(directive), `Missing CSP directive: ${directive}`));

assert.ok(!csp.includes("'unsafe-inline'"), "CSP must not allow unsafe inline code");
assert.ok(!csp.includes("'unsafe-eval'"), "CSP must not allow eval");
assert.ok(!csp.includes("*"), "CSP must not contain wildcard sources");
assert.equal(headers["x-frame-options"], "DENY", "Legacy clickjacking protection must remain enabled");

const executableScripts = [...html.matchAll(/<script\b([^>]*)>/gi)]
  .map(([, attributes]) => attributes)
  .filter((attributes) => !/type=["']application\/ld\+json["']/i.test(attributes));
assert.ok(executableScripts.every((attributes) => /src=["']\//i.test(attributes)), "Executable scripts must be same-origin files");
assert.ok(!/<(?:iframe|object|embed)\b/i.test(html), "Embeddable third-party content is not allowed");
assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/.test(appSource), "Network APIs require privacy review");
assert.ok(!/\.style\.[a-z-]+\s*=/i.test(appSource), "Inline styles are incompatible with the strict CSP");

console.log("Security policy and privacy guardrails verified");
