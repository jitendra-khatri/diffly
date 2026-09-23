import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "public");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(path.join(outputDirectory, "src", "lib"), { recursive: true });
await Promise.all([
  cp(path.join(projectRoot, "index.html"), path.join(outputDirectory, "index.html")),
  cp(path.join(projectRoot, "src", "app.js"), path.join(outputDirectory, "src", "app.js")),
  cp(path.join(projectRoot, "src", "styles.css"), path.join(outputDirectory, "src", "styles.css")),
  cp(path.join(projectRoot, "src", "lib", "diff.js"), path.join(outputDirectory, "src", "lib", "diff.js")),
]);

console.log("Static site generated in public/");
