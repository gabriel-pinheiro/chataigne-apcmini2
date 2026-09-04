import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

const modeMessage = (mode: number) => [0x47, 0x7f, 0x4f, 0x62, 0x00, 0x01, mode];

const introductionResponse = [
  0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
  0, 16, 32, 48, 64, 80, 96, 112, 126
];

async function createReadyRuntime(logInterpretedOutput = false) {
  const result = await createRuntime({ logInterpretedOutput });
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  result.runtime.sysExEvent(introductionResponse);
  result.noteMessages.length = 0;
  result.sysexMessages.length = 0;
  result.logs.length = 0;
  return result;
}

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

  runtime.sysExEvent(modeMessage(3));
  runtime.sysExEvent(modeMessage(3));
  assert.equal(padMode.get(), "node_edit");
  assert.equal(warnings.length, 3);
  assert.match(warnings[2], /Note Edit Mode is not supported/);
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

test("performs one full resync when the mode changes to Session", async () => {
  const result = await createReadyRuntime(true);

  result.runtime.sysExEvent(modeMessage(2));
  assert.deepEqual(result.noteMessages, []);

  result.runtime.sysExEvent(modeMessage(0));
  assert.equal(result.padMode.get(), "session");
  assert.equal(result.noteMessages.length, 80);
  assert.equal(
    result.noteMessages.filter((message) => message[1] <= 63).length,
    64
  );
  assert.equal(
    result.noteMessages.filter((message) => message[1] >= 100).length,
    16
  );
  assert.deepEqual(result.logs, [
    "Full Resync Sent: 64 pad LEDs, 16 button LEDs"
  ]);

  result.runtime.sysExEvent(modeMessage(0));
  assert.equal(result.noteMessages.length, 80);
  assert.equal(result.logs.length, 1);
});

test("defers a Session-mode resync while device initialization is pending", async () => {
  const result = await createRuntime({ logInterpretedOutput: true });
  result.runtime.init();
  result.logs.length = 0;

  result.runtime.sysExEvent(modeMessage(0));

  assert.equal(result.padMode.get(), "session");
  assert.deepEqual(result.noteMessages, []);
  assert.deepEqual(result.sysexMessages, []);
  assert.deepEqual(result.logs, []);
  assert.deepEqual(result.warnings, []);
});

test("does not treat initial Session pad input as a mode-change resync", async () => {
  const result = await createReadyRuntime(true);

  result.runtime.noteOnEvent(1, 56, 127);

  assert.equal(result.padMode.get(), "session");
  assert.equal(result.pads.row1.pad11.isPressed.get(), true);
  assert.deepEqual(result.noteMessages, []);
  assert.deepEqual(result.sysexMessages, []);
  assert.deepEqual(result.logs, []);
});

test("warns about the Notes port and does not map its pitches as pads", async () => {
  const { runtime, devices, pads, warnings, sysexMessages, advanceTime } = await createRuntime({
    devices: ["aPc mini MK2 NoTeS", "control-out"]
  });
  runtime.init();
  advanceTime(1);
  runtime.update(1);
  runtime.noteOnEvent(1, 56, 127);

  assert.equal(pads.row1.pad11.isPressed.get(), false);
  assert.deepEqual(sysexMessages, []);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Notes port is not supported/);
  runtime.moduleParameterChanged(devices);
  assert.equal(warnings.length, 1);
});
