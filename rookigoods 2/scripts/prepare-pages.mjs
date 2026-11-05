import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, "dist", "public");
const target = path.join(root, "docs");

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
fs.copyFileSync(path.join(target, "index.html"), path.join(target, "404.html"));
fs.writeFileSync(path.join(target, ".nojekyll"), "\n");

console.log(`GitHub Pages export ready at ${target}`);
