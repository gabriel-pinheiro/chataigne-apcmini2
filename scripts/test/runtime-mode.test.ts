import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

const modeMessage = (mode: number) => [0x47, 0x7f, 0x4f, 0x62, 0x00, 0x01, mode];

test("tracks explicit pad-mode SysEx and warns once per unsupported transition", async () => {
  const { runtime, padMode, warnings } = await createRuntime();
  runtime.init();

  runtime.sysExEvent(modeMessage(2));
  runtime.sysExEvent(modeMessage(2));
  assert.equal(padMode.get(), "drum");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Drum Mode is not supported/);

  runtime.sysExEvent(modeMessage(0));
  runtime.sysExEvent(modeMessage(1));
  assert.equal(padMode.get(), "note");
  assert.equal(warnings.length, 2);
  assert.match(warnings[1], /Note Mode is not supported/);
});

test("uses Drum MIDI as a fallback without treating it as Session input", async () => {
  const { runtime, pads, padMode, warnings } = await createRuntime();
  runtime.init();

  runtime.noteOnEvent(10, 120, 127);
  runtime.noteOnEvent(10, 120, 127);

  assert.equal(padMode.get(), "drum");
  assert.equal(pads.row1.pad11.isPressed.get(), false);
  assert.equal(warnings.length, 1);
});

test("warns about the Notes port and does not map its pitches as pads", async () => {
  const { runtime, pads, warnings } = await createRuntime({
    devices: ["APC mini mk2 Notes", "APC mini mk2 Control"]
  });
  runtime.init();
  runtime.noteOnEvent(1, 56, 127);

  assert.equal(pads.row1.pad11.isPressed.get(), false);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Notes port is not supported/);
});
