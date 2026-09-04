import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("emits JavaScript compatible with Chataigne's engine", async () => {
  const runtimeSource = await readFile(
    new URL("../../runtime/apc-mini-mkii.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(runtimeSource, /^\s*\w+\.\w+\s*=/m);
  assert.doesNotMatch(runtimeSource, /\.substr\s*\(/);
  assert.doesNotMatch(runtimeSource, /\bswitch\s*\(/);
  assert.doesNotMatch(runtimeSource, /Number\.MAX_VALUE/);
  assert.doesNotMatch(runtimeSource, /\brequire\s*\(/);
  assert.doesNotMatch(runtimeSource, /\bexports\b/);
  assert.doesNotMatch(runtimeSource, /===|!==/);
  assert.doesNotMatch(runtimeSource, /\[[^\]]+\]\.set\s*\(/);
  assert.doesNotMatch(runtimeSource, /\.getChild\s*\(/);

});
