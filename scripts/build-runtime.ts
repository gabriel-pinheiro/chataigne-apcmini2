import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

const projectRoot = new URL("../", import.meta.url);
const sourceFiles = [
  "src/lib/protocol.ts",
  "src/lib/controls.ts",
  "src/lib/logging.ts",
  "src/lib/mode.ts",
  "src/lib/connection.ts",
  "src/apc-mini-mkii.ts"
];

const sources = await Promise.all(
  sourceFiles.map((file) => readFile(new URL(file, projectRoot), "utf8"))
);
const source = sources.join("\n");
const result = await transform(source, {
  loader: "ts",
  target: "es2015",
  format: "cjs",
  sourcefile: "apc-mini-mkii.ts",
  legalComments: "none"
});

const outputDirectory = new URL("runtime/", projectRoot);
const outputPath = new URL("apc-mini-mkii.js", outputDirectory);
await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, result.code, "utf8");
console.log(`Generated ${fileURLToPath(outputPath)}`);
