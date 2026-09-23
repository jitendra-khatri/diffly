import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "public");
const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = deploymentHost
  ? `${/^https?:\/\//.test(deploymentHost) ? "" : "https://"}${deploymentHost}`.replace(/\/$/, "")
  : "http://localhost:5000";
const sourceHtml = await readFile(path.join(projectRoot, "index.html"), "utf8");
const productionHtml = sourceHtml.replaceAll("__SITE_URL__", siteUrl);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(path.join(outputDirectory, "src", "lib"), { recursive: true });
await Promise.all([
  writeFile(path.join(outputDirectory, "index.html"), productionHtml),
  cp(path.join(projectRoot, "design", "implementation.png"), path.join(outputDirectory, "og-image.png")),
  cp(path.join(projectRoot, "src", "app.js"), path.join(outputDirectory, "src", "app.js")),
  cp(path.join(projectRoot, "src", "styles.css"), path.join(outputDirectory, "src", "styles.css")),
  cp(path.join(projectRoot, "src", "lib", "diff.js"), path.join(outputDirectory, "src", "lib", "diff.js")),
  cp(path.join(projectRoot, "src", "lib", "session.js"), path.join(outputDirectory, "src", "lib", "session.js")),
]);

console.log(`Static site generated in public/ for ${siteUrl}`);
