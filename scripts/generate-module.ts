import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { moduleDefinition } from "./lib/module-definition.js";
import {
  validateEnumDefaults,
  validateLeafShortNames
} from "./lib/validation.js";

validateEnumDefaults(moduleDefinition);
validateLeafShortNames(moduleDefinition.parameters, ["Parameters"]);
validateLeafShortNames(moduleDefinition.values, ["Values"]);

const outputPath = fileURLToPath(new URL("../module.json", import.meta.url));
const generatedJson = `${JSON.stringify(moduleDefinition, null, 2)}\n`;

await writeFile(outputPath, generatedJson, "utf8");
console.log(`Generated ${outputPath}`);
