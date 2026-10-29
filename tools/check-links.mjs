import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "tools") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(root);

const ids = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const found = new Set();
  for (const match of html.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) found.add(match[1]);
  ids.set(file, found);
}

const problems = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/\b(href|src|action)\s*=\s*["']([^"']+)["']/gi)) {
    const url = match[2].trim();
    if (!url || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(url)) continue;
    checked += 1;

    if (url.startsWith("#")) {
      const id = decodeURIComponent(url.slice(1));
      if (id && !ids.get(file)?.has(id)) {
        problems.push(`${path.relative(root, file)}: ${match[1]}="${url}" -> missing #${id} on this page`);
      }
      continue;
    }

    const hashIndex = url.indexOf("#");
    const hash = hashIndex >= 0 ? decodeURIComponent(url.slice(hashIndex + 1)) : "";
    const pathPart = (hashIndex >= 0 ? url.slice(0, hashIndex) : url).split("?")[0];
    if (!pathPart) continue;

    const target = path.resolve(path.dirname(file), pathPart);
    if (!fs.existsSync(target)) {
      problems.push(`${path.relative(root, file)}: ${match[1]}="${url}" -> file not found (${path.relative(root, target)})`);
      continue;
    }

    if (hash && !ids.get(target)?.has(hash)) {
      problems.push(`${path.relative(root, file)}: ${match[1]}="${url}" -> missing #${hash} in ${path.relative(root, target)}`);
    }
  }
}

console.log(`Checked ${htmlFiles.length} HTML files and ${checked} internal links.`);

if (problems.length) {
  console.error(`\n${problems.length} broken link(s):`);
  for (const problem of [...new Set(problems)]) console.error(` - ${problem}`);
  process.exitCode = 1;
} else {
  console.log("No broken internal links or anchors found.");
}
