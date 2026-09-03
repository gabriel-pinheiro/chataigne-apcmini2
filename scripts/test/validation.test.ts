import assert from "node:assert/strict";
import test from "node:test";

import { moduleDefinition } from "../lib/module-definition.js";
import { validateEnumDefaults } from "../lib/validation.js";

test("accepts every enum default in the generated module", () => {
  assert.doesNotThrow(() => validateEnumDefaults(moduleDefinition));
});

test("rejects an enum default that is not an option label", () => {
  assert.throws(
    () => validateEnumDefaults({
      type: "Enum",
      default: "Missing",
      options: { Present: "present" }
    }),
    /must be an option label/
  );
});
