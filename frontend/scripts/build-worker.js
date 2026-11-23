import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const index = await readFile("dist/index.html", "utf8"),
  hash = createHash("sha256").update(index).digest("hex").slice(0, 12);
const assets = (await readdir("dist/assets")).map((name) => `/assets/${name}`);
const source = await readFile("public/sw.js", "utf8");
await writeFile(
  "dist/sw.js",
  source
    .replace(
      /const SHELL_CACHE\s*=\s*["']langkahku-shell-v1["'];/,
      `const SHELL_CACHE = 'langkahku-shell-${hash}';`,
    )
    .replace(
      /const SHELL_ASSETS\s*=\s*\[[\s\S]*?\];/,
      `const SHELL_ASSETS = ${JSON.stringify(["/", "/icons/icon.svg", "/manifest.webmanifest", "/worksheets/lembar-langkahku.html", ...assets])};`,
    ),
);
console.log("Service worker siap: shell publik berhash; API tidak dicache.");
