import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "public");
const siteUrl = (process.env.SITE_URL || "https://www.thediffly.com").replace(/\/$/, "");
const lastModified = new Date().toISOString().slice(0, 10);
const sourceHtml = await readFile(path.join(projectRoot, "index.html"), "utf8");
const productionHtml = sourceHtml.replaceAll("__SITE_URL__", siteUrl);
const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastModified}</lastmod>
  </url>
</urlset>
`;

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(path.join(outputDirectory, "src", "lib"), { recursive: true });
await Promise.all([
  writeFile(path.join(outputDirectory, "index.html"), productionHtml),
  writeFile(path.join(outputDirectory, "robots.txt"), robots),
  writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap),
  cp(
    path.join(projectRoot, "google5b4dd72cb6016cff.html"),
    path.join(outputDirectory, "google5b4dd72cb6016cff.html"),
  ),
  cp(path.join(projectRoot, "design", "implementation.png"), path.join(outputDirectory, "og-image.png")),
  cp(path.join(projectRoot, "favicon.svg"), path.join(outputDirectory, "favicon.svg")),
  cp(path.join(projectRoot, "site.webmanifest"), path.join(outputDirectory, "site.webmanifest")),
  cp(path.join(projectRoot, "src", "app.js"), path.join(outputDirectory, "src", "app.js")),
  cp(path.join(projectRoot, "src", "styles.css"), path.join(outputDirectory, "src", "styles.css")),
  cp(path.join(projectRoot, "src", "lib", "diff.js"), path.join(outputDirectory, "src", "lib", "diff.js")),
  cp(path.join(projectRoot, "src", "lib", "session.js"), path.join(outputDirectory, "src", "lib", "session.js")),
]);

console.log(`Static site generated in public/ for ${siteUrl}`);
