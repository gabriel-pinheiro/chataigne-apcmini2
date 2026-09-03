import assert from "node:assert/strict";
import test from "node:test";

import {
  buttonParameters,
  buttonValues,
  SCENE_BUTTON_COUNT,
  TRACK_BUTTON_COUNT
} from "../lib/buttons.js";
import { CHANNEL_FADER_COUNT, faderValues } from "../lib/faders.js";
import {
  PAD_COLUMN_COUNT,
  padParameters,
  PAD_ROW_COUNT,
  padValues
} from "../lib/pads.js";
import type { JsonValue } from "../lib/schema.js";
import { statusValues } from "../lib/status.js";

const metadataKeys = new Set(["type", "collapsed"]);

function childCount(value: JsonValue): number {
  assert.ok(value !== null && !Array.isArray(value) && typeof value === "object");
  return Object.keys(value).filter((key) => !metadataKeys.has(key)).length;
}

function collectByShortName(value: JsonValue, shortName: string): Record<string, JsonValue>[] {
  if (Array.isArray(value) || value === null || typeof value !== "object") {
    return [];
  }

  const matches = value.shortName === shortName ? [value] : [];
  return matches.concat(
    Object.values(value).flatMap((child) => collectByShortName(child, shortName))
  );
}

test("builds the complete 8 by 8 pad hierarchy", () => {
  const parameters = padParameters();
  const values = padValues();

  assert.equal(Object.keys(parameters).length, PAD_ROW_COUNT);
  assert.equal(Object.keys(values).length, PAD_ROW_COUNT);

  for (let row = 1; row <= PAD_ROW_COUNT; row += 1) {
    assert.equal(childCount(parameters[`Row ${row}`]), PAD_COLUMN_COUNT);
    assert.equal(childCount(values[`Row ${row}`]), PAD_COLUMN_COUNT);
  }
});

test("builds track, scene, shift, and fader controls", () => {
  const parameters = buttonParameters();
  const values = buttonValues();
  const faders = faderValues();

  assert.equal(childCount(parameters["Track Buttons"]), TRACK_BUTTON_COUNT);
  assert.equal(childCount(parameters["Scene Buttons"]), SCENE_BUTTON_COUNT);
  assert.equal(childCount(values["Track Buttons"]), TRACK_BUTTON_COUNT);
  assert.equal(childCount(values["Scene Buttons"]), SCENE_BUTTON_COUNT);
  assert.ok("Shift" in values);
  assert.equal(Object.keys(faders).length, CHANNEL_FADER_COUNT + 1);
  assert.ok("Master Fader" in faders);
});

test("exposes a stable read-only pad mode status", () => {
  const status = statusValues();
  const padMode = status["Pad Mode"];

  assert.ok(padMode !== null && !Array.isArray(padMode) && typeof padMode === "object");
  assert.equal(padMode.shortName, "padMode");
  assert.equal(padMode.default, "Unknown");
  assert.equal(padMode.readOnly, true);
  assert.deepEqual(padMode.options, {
    Unknown: "unknown",
    Session: "session",
    Note: "note",
    Drum: "drum"
  });
});

test("initializes all palette modes consistently with Exact RGB", () => {
  const paletteModes = collectByShortName(padParameters(), "paletteMode");

  assert.equal(paletteModes.length, PAD_ROW_COUNT * PAD_COLUMN_COUNT);
  for (const paletteMode of paletteModes) {
    assert.equal(paletteMode.enabled, false);
    assert.deepEqual(paletteMode.dependency, {
      source: "colorMode",
      value: "palette",
      check: "equals",
      action: "enable"
    });
  }
});
