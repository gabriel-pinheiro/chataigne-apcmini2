import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

const introductionResponse = [
  0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
  0, 16, 32, 48, 64, 80, 96, 112, 126
];

const nativePaletteModes = [
  ["solid10", 1, "Solid - 10%"],
  ["solid25", 2, "Solid - 25%"],
  ["solid50", 3, "Solid - 50%"],
  ["solid65", 4, "Solid - 65%"],
  ["solid75", 5, "Solid - 75%"],
  ["solid90", 6, "Solid - 90%"],
  ["solid100", 7, "Solid - 100%"],
  ["pulse16", 8, "Pulse - 1/16"],
  ["pulse8", 9, "Pulse - 1/8"],
  ["pulse4", 10, "Pulse - 1/4"],
  ["pulse2", 11, "Pulse - 1/2"],
  ["blink24", 12, "Blink - 1/24"],
  ["blink16", 13, "Blink - 1/16"],
  ["blink8", 14, "Blink - 1/8"],
  ["blink4", 15, "Blink - 1/4"],
  ["blink2", 16, "Blink - 1/2"]
] as const;

async function createReadyRuntime(logInterpretedOutput = false) {
  const result = await createRuntime({ logInterpretedOutput });
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  result.runtime.sysExEvent(introductionResponse);
  return result;
}

test("matches effective colors against the official palette with stable ties", async () => {
  const { runtime } = await createRuntime();

  assert.deepEqual(Array.from(runtime.effectiveColorRgb([1, 0.5, 0.25, 0.5])), [128, 64, 32]);
  assert.equal(runtime.nearestHardwarePaletteIndex([0, 0, 0]), 0);
  assert.equal(runtime.nearestHardwarePaletteIndex([255, 0, 0]), 5);
  assert.equal(runtime.nearestHardwarePaletteIndex([0, 255, 0]), 21);
  assert.equal(runtime.nearestHardwarePaletteIndex([0, 0, 255]), 45);
  assert.deepEqual(Array.from(runtime.hardwarePaletteRgb(5)), [255, 0, 0]);
});

test("uses palette black for every disabled pad during full resync", async () => {
  const { sysexMessages, noteMessages } = await createReadyRuntime();
  const padMessages = noteMessages.filter((message) => message[1] <= 63);

  assert.equal(sysexMessages.length, 1);
  assert.equal(padMessages.length, 64);
  const expectedNotes = Array.from(
    { length: 64 },
    (_, index) => (7 - Math.floor(index / 8)) * 8 + index % 8
  );
  assert.deepEqual(padMessages, expectedNotes.map((note) => [7, note, 0]));
});

test("sends an immediate Exact RGB update with RGB multiplied by alpha", async () => {
  const { runtime, padParameters, noteMessages, sysexMessages, logs } =
    await createReadyRuntime(true);
  noteMessages.length = 0;
  sysexMessages.length = 0;
  logs.length = 0;

  const pad = padParameters.row4.pad46;
  pad.color.set([1, 0.5, 0.25, 0.5]);
  runtime.moduleParameterChanged(pad.color);
  assert.equal(sysexMessages.length, 0);

  pad.ledEnabled.set(true);
  runtime.moduleParameterChanged(pad.ledEnabled);

  assert.deepEqual(noteMessages, []);
  assert.deepEqual(sysexMessages, [[
    0x47, 0x7f, 0x4f, 0x24, 0x00, 0x08,
    37, 37, 1, 0, 0, 64, 0, 32
  ]]);
  assert.deepEqual(logs, ["Pad LED Updated: 4.6 = #804020"]);
});

test("renders every native Hardware Palette brightness, pulse, and blink mode", async () => {
  const { runtime, padParameters, noteMessages, sysexMessages, logs } =
    await createReadyRuntime(true);
  noteMessages.length = 0;
  sysexMessages.length = 0;
  logs.length = 0;
  const pad = padParameters.row1.pad11;

  pad.color.set([1, 0, 0, 1]);
  runtime.moduleParameterChanged(pad.color);
  assert.equal(noteMessages.length, 0);
  assert.equal(sysexMessages.length, 0);

  pad.ledEnabled.set(true);
  pad.colorMode.set("palette");
  runtime.moduleParameterChanged(pad.colorMode);
  assert.deepEqual(noteMessages, [[7, 56, 5]]);
  assert.deepEqual(logs, [
    "Pad LED Updated: 1.1 = Palette 5 #FF0000, Solid - 100% (requested #FF0000)"
  ]);

  noteMessages.length = 0;
  logs.length = 0;
  for (const [mode, channel] of nativePaletteModes) {
    pad.paletteMode.set(mode);
    runtime.moduleParameterChanged(pad.paletteMode);
    assert.deepEqual(noteMessages.at(-1), [channel, 56, 5]);
  }
  assert.deepEqual(
    logs,
    nativePaletteModes.map(([, , label]) =>
      `Pad LED Updated: 1.1 = Palette 5 #FF0000, ${label} (requested #FF0000)`
    )
  );

  const green = [0, 1, 0, 0.5] as [number, number, number, number];
  const effectiveGreen = Array.from(runtime.effectiveColorRgb(green));
  const greenIndex = runtime.nearestHardwarePaletteIndex(effectiveGreen);
  pad.color.set(green);
  runtime.moduleParameterChanged(pad.color);
  assert.deepEqual(noteMessages.at(-1), [16, 56, greenIndex]);

  pad.colorMode.set("rgb");
  runtime.moduleParameterChanged(pad.colorMode);
  assert.deepEqual(sysexMessages.at(-1)?.slice(-6), [0, 0, 1, 0, 0, 0]);

  pad.ledEnabled.set(false);
  runtime.moduleParameterChanged(pad.ledEnabled);
  assert.deepEqual(noteMessages.at(-1), [7, 56, 0]);
  assert.equal(logs.at(-1), "Pad LED Disabled: 1.1");
});

test("does not transmit color or mode changes while a pad is disabled", async () => {
  const { runtime, padParameters, noteMessages, sysexMessages } = await createReadyRuntime();
  noteMessages.length = 0;
  sysexMessages.length = 0;
  const pad = padParameters.row1.pad11;

  pad.color.set([1, 0, 0, 1]);
  runtime.moduleParameterChanged(pad.color);
  pad.colorMode.set("palette");
  runtime.moduleParameterChanged(pad.colorMode);
  pad.paletteMode.set("pulse4");
  runtime.moduleParameterChanged(pad.paletteMode);

  assert.deepEqual(noteMessages, []);
  assert.deepEqual(sysexMessages, []);
});

test("full resync mixes palette Note On messages with combined Exact RGB records", async () => {
  const result = await createRuntime({ logInterpretedOutput: true });
  result.runtime.init();

  const exactPad = result.padParameters.row1.pad11;
  exactPad.ledEnabled.set(true);
  exactPad.color.set([1, 1, 1, 1]);

  const palettePad = result.padParameters.row2.pad22;
  palettePad.ledEnabled.set(true);
  palettePad.colorMode.set("palette");
  palettePad.color.set([1, 0, 0, 1]);
  palettePad.paletteMode.set("pulse4");

  result.advanceTime(0.11);
  result.runtime.update(0.11);
  result.runtime.sysExEvent(introductionResponse);

  const padMessages = result.noteMessages.filter((message) => message[1] <= 63);
  assert.equal(padMessages.length, 63);
  assert.ok(result.noteMessages.some((message) =>
    message[0] === 10 && message[1] === 49 && message[2] === 5
  ));
  assert.ok(!result.noteMessages.some((message) => message[1] === 56));

  assert.equal(result.sysexMessages.length, 2);
  assert.deepEqual(result.sysexMessages[1], [
    0x47, 0x7f, 0x4f, 0x24, 0x00, 0x08,
    56, 56, 1, 127, 1, 127, 1, 127
  ]);
  assert.equal(result.logs.at(-1), "Full Resync Sent: 64 pad LEDs, 16 button LEDs");
});

test("suppresses pad output while initializing and resyncs only the latest state", async () => {
  const { runtime, advanceTime, padParameters, noteMessages, sysexMessages } =
    await createRuntime();
  runtime.init();
  const pad = padParameters.row8.pad81;
  pad.ledEnabled.set(true);
  runtime.moduleParameterChanged(pad.ledEnabled);
  pad.color.set([0.25, 0.5, 1, 0.5]);
  runtime.moduleParameterChanged(pad.color);
  assert.equal(noteMessages.length, 0);
  assert.equal(sysexMessages.length, 0);

  advanceTime(0.11);
  runtime.update(0.11);
  runtime.sysExEvent(introductionResponse);

  assert.equal(noteMessages.filter((message) => message[1] <= 63).length, 63);
  assert.equal(sysexMessages.length, 2);
  assert.deepEqual(sysexMessages[1], [
    0x47, 0x7f, 0x4f, 0x24, 0x00, 0x08,
    0, 0, 0, 32, 0, 64, 1, 0
  ]);
});

test("resyncs after initialization timeout while keeping the timeout warning", async () => {
  const { runtime, advanceTime, noteMessages, sysexMessages, warnings } =
    await createRuntime();
  runtime.init();
  advanceTime(0.11);
  runtime.update(0.11);
  advanceTime(0.51);
  runtime.update(0.51);
  advanceTime(0.51);
  runtime.update(0.51);

  assert.equal(sysexMessages.length, 2);
  assert.equal(noteMessages.filter((message) => message[1] <= 63).length, 64);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Introduction did not respond/);
});

test("runs manual Full Resync only when ready and gates its summary log", async () => {
  const disconnected = await createRuntime({ connected: false });
  disconnected.runtime.init();
  disconnected.runtime.fullResync();
  assert.deepEqual(disconnected.noteMessages, []);
  assert.deepEqual(disconnected.sysexMessages, []);
  assert.deepEqual(disconnected.warnings, [
    "Full Resync ignored: MIDI device is disconnected."
  ]);

  const pending = await createRuntime();
  pending.runtime.init();
  pending.runtime.fullResync();
  assert.deepEqual(pending.noteMessages, []);
  assert.deepEqual(pending.sysexMessages, []);
  assert.deepEqual(pending.warnings, [
    "Full Resync ignored: device initialization is still pending."
  ]);

  const readyWithoutLogs = await createReadyRuntime();
  readyWithoutLogs.noteMessages.length = 0;
  readyWithoutLogs.sysexMessages.length = 0;
  readyWithoutLogs.runtime.fullResync();
  assert.equal(readyWithoutLogs.noteMessages.length, 80);
  assert.equal(readyWithoutLogs.sysexMessages.length, 0);
  assert.deepEqual(readyWithoutLogs.logs, []);

  const readyWithLogs = await createReadyRuntime(true);
  readyWithLogs.noteMessages.length = 0;
  readyWithLogs.sysexMessages.length = 0;
  readyWithLogs.logs.length = 0;
  readyWithLogs.runtime.fullResync();
  assert.equal(readyWithLogs.noteMessages.length, 80);
  assert.equal(readyWithLogs.sysexMessages.length, 0);
  assert.deepEqual(readyWithLogs.logs, [
    "Full Resync Sent: 64 pad LEDs, 16 button LEDs"
  ]);
});
