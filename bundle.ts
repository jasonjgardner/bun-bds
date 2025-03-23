import * as Bun from "bun";
import { join, resolve, dirname } from "node:path";
import { writeFile } from "node:fs/promises";

// Frontend build

const DEST = join(process.cwd(), "static");
const outdir = join(DEST, "scripts");
await Bun.build({
  entrypoints: [join(process.cwd(), "app/index.tsx")],
  outdir,
  sourcemap: "external",
});

console.log(`Built to ${outdir}.`);

console.log("Build complete.");
