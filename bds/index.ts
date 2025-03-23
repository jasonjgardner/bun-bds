import bdsServer from "./client";
import build from "./build";

await build();
await bdsServer();