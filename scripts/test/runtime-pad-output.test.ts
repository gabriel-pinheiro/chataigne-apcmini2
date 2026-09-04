import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

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
  return result;
}

test("sends all 64 pads in one Exact RGB SysEx after initialization", async () => {
  const { sysexMessages } = await createReadyRuntime();
  assert.equal(sysexMessages.length, 2);

  const message = sysexMessages[1];
  assert.equal(message.length, 6 + 64 * 8);
  assert.deepEqual(message.slice(0, 6), [0x47, 0x7f, 0x4f, 0x24, 0x04, 0x00]);
  const notesInUiOrder = Array.from(
    { length: 64 },
    (_, index) => (7 - Math.floor(index / 8)) * 8 + index % 8
  );
  for (let index = 0; index < notesInUiOrder.length; index += 1) {
    const note = notesInUiOrder[index];
    const offset = 6 + index * 8;
    assert.deepEqual(message.slice(offset, offset + 8), [note, note, 0, 0, 0, 0, 0, 0]);
  }
});

test("sends an immediate per-pad update with RGB multiplied by alpha", async () => {
  const { runtime, padParameters, sysexMessages, logs } = await createReadyRuntime(true);
  sysexMessages.length = 0;
  logs.length = 0;

  const pad = padParameters.row4.pad46;
  pad.color.set([1, 0.5, 0.25, 0.5]);
  runtime.moduleParameterChanged(pad.color);
  assert.equal(sysexMessages.length, 0);

  pad.ledEnabled.set(true);
  runtime.moduleParameterChanged(pad.ledEnabled);

  assert.deepEqual(sysexMessages, [[
    0x47, 0x7f, 0x4f, 0x24, 0x00, 0x08,
    37, 37, 1, 0, 0, 64, 0, 32
  ]]);
  assert.deepEqual(logs, ["Pad LED Updated: 4.6 = #804020"]);
});

test("turns disabled and temporarily unsupported palette pads black", async () => {
  const { runtime, padParameters, sysexMessages } = await createReadyRuntime();
  const pad = padParameters.row1.pad11;
  sysexMessages.length = 0;

  pad.color.set([1, 0, 0, 1]);
  runtime.moduleParameterChanged(pad.color);
  pad.ledEnabled.set(true);
  runtime.moduleParameterChanged(pad.ledEnabled);
  assert.deepEqual(sysexMessages.at(-1)?.slice(-6), [1, 127, 0, 0, 0, 0]);

  pad.colorMode.set("palette");
  runtime.moduleParameterChanged(pad.colorMode);
  assert.deepEqual(sysexMessages.at(-1)?.slice(-6), [0, 0, 0, 0, 0, 0]);

  const messageCount = sysexMessages.length;
  pad.color.set([0, 1, 0, 1]);
  runtime.moduleParameterChanged(pad.color);
  pad.paletteMode.set("blink4");
  runtime.moduleParameterChanged(pad.paletteMode);
  assert.equal(sysexMessages.length, messageCount);

  pad.colorMode.set("rgb");
  runtime.moduleParameterChanged(pad.colorMode);
  assert.deepEqual(sysexMessages.at(-1)?.slice(-6), [0, 0, 1, 127, 0, 0]);

  pad.ledEnabled.set(false);
  runtime.moduleParameterChanged(pad.ledEnabled);
  assert.deepEqual(sysexMessages.at(-1)?.slice(-6), [0, 0, 0, 0, 0, 0]);
});

test("suppresses pad output while initializing and resyncs only the latest state", async () => {
  const { runtime, advanceTime, padParameters, sysexMessages } = await createRuntime();
  runtime.init();
  const pad = padParameters.row8.pad81;
  pad.ledEnabled.set(true);
  runtime.moduleParameterChanged(pad.ledEnabled);
  pad.color.set([0.25, 0.5, 1, 0.5]);
  runtime.moduleParameterChanged(pad.color);
  assert.equal(sysexMessages.length, 0);

  advanceTime(0.11);
  runtime.update(0.11);
  runtime.sysExEvent(introductionResponse);

  assert.equal(sysexMessages.length, 2);
  const fullResync = sysexMessages[1];
  const padOffset = 6 + 56 * 8;
  assert.deepEqual(fullResync.slice(padOffset, padOffset + 8), [0, 0, 0, 32, 0, 64, 1, 0]);
});

test("resyncs after initialization timeout while keeping the timeout warning", async () => {
  const { runtime, advanceTime, sysexMessages, warnings } = await createRuntime();
  runtime.init();
  advanceTime(0.11);
  runtime.update(0.11);
  advanceTime(1.01);
  runtime.update(1.01);

  assert.equal(sysexMessages.length, 2);
  assert.equal(sysexMessages[1][3], 0x24);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /did not respond to initialization/);
});

test("runs manual Full Resync only when ready and gates its summary log", async () => {
  const disconnected = await createRuntime({ connected: false });
  disconnected.runtime.init();
  disconnected.runtime.fullResync();
  assert.deepEqual(disconnected.sysexMessages, []);
  assert.deepEqual(disconnected.warnings, [
    "Full Resync ignored: MIDI device is disconnected."
  ]);

  const pending = await createRuntime();
  pending.runtime.init();
  pending.runtime.fullResync();
  assert.deepEqual(pending.sysexMessages, []);
  assert.deepEqual(pending.warnings, [
    "Full Resync ignored: device initialization is still pending."
  ]);

  const readyWithoutLogs = await createReadyRuntime();
  readyWithoutLogs.sysexMessages.length = 0;
  readyWithoutLogs.runtime.fullResync();
  assert.equal(readyWithoutLogs.sysexMessages.length, 1);
  assert.deepEqual(readyWithoutLogs.logs, []);

  const readyWithLogs = await createReadyRuntime(true);
  readyWithLogs.sysexMessages.length = 0;
  readyWithLogs.logs.length = 0;
  readyWithLogs.runtime.fullResync();
  assert.equal(readyWithLogs.sysexMessages.length, 1);
  assert.deepEqual(readyWithLogs.logs, ["Full Resync Sent: 64 pad LEDs"]);
});
