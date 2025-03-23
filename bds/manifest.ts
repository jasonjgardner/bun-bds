const BP_UUID = "e9cf6063-b09c-4f38-98cc-b2c9a370331e";
const MODULE_UUID = "4c9c2727-6b50-4df6-98be-f38dc55b3b09";

const manifest = {
  format_version: 2,
  header: {
    name: "Sever Connection",
    description: "Scripts to call HTTP server",
    uuid: BP_UUID,
    version: [1, 0, 0],
    min_engine_version: [1, 21, 0],
  },
  modules: [
    {
      entry: "main.js",
      type: "script",
      language: "javascript",
      uuid: MODULE_UUID,
      version: [1, 0, 0],
    },
  ],
  dependencies: [
    {
      module_name: "@minecraft/server",
      version: "1.18.0-beta",
    },
    {
      module_name: "@minecraft/server-net",
      version: "1.0.0-beta",
    },
  ],
};

export default manifest;
