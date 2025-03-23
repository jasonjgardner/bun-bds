import * as Bun from "bun";
import { dirname, join, resolve } from "node:path";
import { writeFile, readFile, unlink } from "node:fs/promises";
import manifest from "./manifest";
import { BP_PACK_NAME } from "../_constants";
import { ensureDir, move } from "fs-extra"

export default async function build() {
  const DEST = join(
    process.env.BDS_PATH || resolve(process.cwd(), "build"),
    "development_behavior_packs",
    BP_PACK_NAME,
  );

  const outdir = join(DEST, "scripts");

  await ensureDir(outdir);

  const ROOT_DIR = join(process.cwd(), "bds", "src");

  await Bun.build({
    entrypoints: [join(ROOT_DIR, "main.ts")],
    outdir,
    external: ["@minecraft/server", "@minecraft/server-net", "@minecraft/server-ui"],
    sourcemap: "external",
    root: ROOT_DIR
  });

  console.log(`Built to ${DEST}.`);

  // Append text to the end of the built file
  const builtFile = join(outdir, "main.js");
  const built = await readFile(builtFile, "utf-8");
  await writeFile(
    builtFile,
    `${built}\n\n//# sourceMappingURL=../debug/main.js.map\n`,
  );

  // Move sourcemap file into debug folder
  const mapFile = join(outdir, "main.js.map");
  const debugMap = join(DEST, "debug", "main.js.map");
  await ensureDir(dirname(debugMap));
  
  try {
    // Delete the old map file
    await unlink(debugMap);
  } catch (err) {
    console.warn("Failed to delete old map file: %s", err);
  }
  
  await move(mapFile, debugMap);

  await writeFile(
    join(DEST, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log("Build complete.");
}

if (import.meta.main) {
  await build();
}