import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const outputDir = path.join(root, "dist", "可直接预览");
const tempDir = path.join(root, ".standalone-build");
const entries = [
  { name: "基础数据中心后台.html", entry: "src/standalone/admin.tsx", title: "基础数据中心后台 · 数据基座 2.0" },
  { name: "基础数据中心前台.html", entry: "src/standalone/frontend.tsx", title: "基础数据中心前台 · 数据基座 2.0" },
  { name: "接入中心.html", entry: "src/standalone/access.tsx", title: "接入中心 · 数据基座 2.0" },
];

await rm(outputDir, { recursive: true, force: true });
await rm(tempDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const item of entries) {
  const entrySlug = item.name.replace(/\.html$/, "");
  const result = await build({
    absWorkingDir: root,
    entryPoints: [item.entry],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    minify: true,
    outdir: path.join(tempDir, entrySlug),
    write: true,
    entryNames: "bundle",
    loader: { ".tsx": "tsx", ".ts": "ts", ".css": "css" },
  });
  const js = await readFile(path.join(tempDir, entrySlug, "bundle.js"), "utf8");
  const css = await readFile(path.join(tempDir, entrySlug, "bundle.css"), "utf8");
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${item.title}</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${js}</script>
  </body>
</html>
`;
  await writeFile(path.join(outputDir, item.name), html, "utf8");
  await writeFile(path.join(root, item.name), html, "utf8");
}

await rm(tempDir, { recursive: true, force: true });
console.log(`Created ${entries.length} standalone HTML files in ${path.relative(root, outputDir)}`);
