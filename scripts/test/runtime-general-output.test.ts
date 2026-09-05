import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

const introductionResponse = [
  0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
  0, 16, 32, 48, 64, 80, 96, 112, 126
];

type Runtime = Awaited<ReturnType<typeof createRuntime>>;

function initialize(result: Runtime): void {
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  result.runtime.sysExEvent(introductionResponse);
  clearOutput(result);
}

function clearOutput(result: Runtime): void {
  result.noteMessages.length = 0;
  result.sysexMessages.length = 0;
  result.identityMessages.length = 0;
  result.logs.length = 0;
}

function assertAllOff(result: Runtime): void {
  assert.equal(result.noteMessages.length, 80);
  assert.equal(new Set(result.noteMessages.map((message) => message[1])).size, 80);
  for (const [channel, note, velocity] of result.noteMessages) {
    assert.equal(channel, note < 64 ? 7 : 1);
    assert.equal(velocity, 0);
  }
  assert.deepEqual(result.sysexMessages, []);
  assert.deepEqual(result.identityMessages, []);
}

test("blackout overrides all LEDs and restores the latest settings without a handshake", async () => {
  const result = await createRuntime({ logInterpretedOutput: true });
  initialize(result);
  const { runtime, blackout, padBrightness } = result;
  const exact = result.padParameters.row1.pad11;
  const palette = result.padParameters.row1.pad12;
  const disabled = result.padParameters.row1.pad13;
  const track = result.trackButtonParameters.track1.ledMode;
  const scene = result.sceneButtonParameters.scene8.ledMode;
  exact.ledEnabled.set(true);
  palette.ledEnabled.set(true);
  palette.colorMode.set("palette");
  palette.paletteMode.set("pulse4");
  track.set("blink");
  scene.set("on");
  runtime.fullResync();
  clearOutput(result);
  const faderHistory = [...result.faders.fader1.position.setHistory];
  const clockHistory = [...result.midiSendClock.setHistory];

  blackout.set(true);
  runtime.moduleParameterChanged(blackout);
  assertAllOff(result);
  assert.deepEqual(result.logs, [
    "Blackout Enabled",
    "Full Resync Sent: 64 pad LEDs, 16 button LEDs"
  ]);
  assert.equal(exact.ledEnabled.get(), true);
  assert.equal(palette.paletteMode.get(), "pulse4");
  assert.equal(track.get(), "blink");
  clearOutput(result);

  exact.color.set([1, 0.5, 0.25, 0.5]);
  runtime.moduleParameterChanged(exact.color);
  palette.color.set([0, 1, 0, 1]);
  runtime.moduleParameterChanged(palette.color);
  palette.paletteMode.set("blink8");
  runtime.moduleParameterChanged(palette.paletteMode);
  // Changing color modes and enable state cannot bypass blackout either.
  palette.colorMode.set("rgb");
  runtime.moduleParameterChanged(palette.colorMode);
  palette.colorMode.set("palette");
  runtime.moduleParameterChanged(palette.colorMode);
  disabled.ledEnabled.set(true);
  runtime.moduleParameterChanged(disabled.ledEnabled);
  disabled.ledEnabled.set(false);
  runtime.moduleParameterChanged(disabled.ledEnabled);
  track.set("on");
  runtime.moduleParameterChanged(track);
  scene.set("blink");
  runtime.moduleParameterChanged(scene);
  assert.equal(result.noteMessages.length, 9);
  assert.ok(result.noteMessages.every((message) => message[2] === 0));
  assert.deepEqual(result.sysexMessages, []);
  assert.ok(result.logs.includes("Pad LED Blacked Out: 1.1"));
  assert.ok(result.logs.includes("Button LED Updated: Track 1 = Off"));
  clearOutput(result);

  padBrightness.set("dim");
  runtime.moduleParameterChanged(padBrightness);
  assertAllOff(result);
  assert.deepEqual(result.logs, [
    "Pad Brightness Changed: Dim (40%)",
    "Full Resync Sent: 64 pad LEDs, 16 button LEDs"
  ]);
  clearOutput(result);
  runtime.fullResync();
  assertAllOff(result);
  clearOutput(result);

  blackout.set(false);
  runtime.moduleParameterChanged(blackout);
  assert.equal(result.noteMessages.length, 79);
  assert.deepEqual(result.sysexMessages, [[
    0x47, 0x7f, 0x4f, 0x24, 0, 8,
    56, 56, 0, 51, 0, 26, 0, 13
  ]]);
  // Dim green matches the native dark-green entry.
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 57), [14, 57, 22]);
  assert.ok(result.noteMessages.some((message) =>
    message[0] === 7 && message[1] === 58 && message[2] === 0
  ));
  assert.deepEqual(result.noteMessages.filter((message) =>
    message[1] === 100 || message[1] === 119
  ), [[1, 100, 1], [1, 119, 2]]);
  assert.deepEqual(exact.color.get(), [1, 0.5, 0.25, 0.5]);
  assert.deepEqual(exact.ledEnabled.setHistory, [true]);
  assert.deepEqual(palette.paletteMode.setHistory, ["pulse4", "blink8"]);
  assert.deepEqual(track.setHistory, ["blink", "on"]);
  assert.deepEqual(result.identityMessages, []);
  assert.deepEqual(result.faders.fader1.position.setHistory, faderHistory);
  assert.deepEqual(result.midiSendClock.setHistory, clockHistory);
});

test("brightness scales alpha before rounding and palette matching in both output paths", async () => {
  const result = await createRuntime();
  initialize(result);
  const exact = result.padParameters.row1.pad11;
  const palette = result.padParameters.row1.pad12;
  exact.ledEnabled.set(true);
  // Rounding alpha first would incorrectly produce 50 instead of 49.
  exact.color.set([1, 0.5, 0.25, 0.485]);
  palette.ledEnabled.set(true);
  palette.colorMode.set("palette");
  palette.color.set([1, 0, 0, 0.485]);
  palette.paletteMode.set("solid50");
  result.padBrightness.set("dim");
  result.runtime.moduleParameterChanged(result.padBrightness);

  assert.equal(result.noteMessages.length, 79);
  assert.deepEqual(result.sysexMessages, [[
    0x47, 0x7f, 0x4f, 0x24, 0, 8,
    56, 56, 0, 49, 0, 25, 0, 12
  ]]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 57), [3, 57, 121]);
  assert.deepEqual(result.identityMessages, []);
  assert.deepEqual(result.logs, []);
  clearOutput(result);

  result.runtime.moduleParameterChanged(exact.color);
  result.runtime.moduleParameterChanged(palette.color);
  assert.deepEqual(result.sysexMessages[0].slice(6), [56, 56, 0, 49, 0, 25, 0, 12]);
  assert.deepEqual(result.noteMessages, [[3, 57, 121]]);
});

test("Dim and Full preserve button On and Blink modes", async () => {
  const result = await createRuntime();
  initialize(result);
  result.padParameters.row1.pad11.ledEnabled.set(true);
  result.padParameters.row1.pad12.ledEnabled.set(true);
  result.padParameters.row1.pad12.colorMode.set("palette");
  result.padParameters.row1.pad12.paletteMode.set("pulse4");
  result.trackButtonParameters.track1.ledMode.set("on");
  result.sceneButtonParameters.scene1.ledMode.set("blink");
  result.padBrightness.set("dim");
  result.runtime.moduleParameterChanged(result.padBrightness);

  assert.deepEqual(result.sysexMessages[0].slice(6), [56, 56, 0, 102, 0, 102, 0, 102]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 57), [10, 57, 118]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 100), [1, 100, 1]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 112), [1, 112, 2]);
  assert.equal(result.blackout.get(), false);

  clearOutput(result);
  result.padBrightness.set("full");
  result.runtime.moduleParameterChanged(result.padBrightness);
  assert.equal(result.noteMessages.length, 79);
  assert.deepEqual(result.sysexMessages[0].slice(6), [56, 56, 1, 127, 1, 127, 1, 127]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 57), [10, 57, 3]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 100), [1, 100, 1]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 112), [1, 112, 2]);
  assert.deepEqual(result.identityMessages, []);
});

test("initialization and reconnect respect saved blackout and brightness", async () => {
  const result = await createRuntime({ blackout: true, padBrightness: "dim" });
  result.padParameters.row1.pad11.ledEnabled.set(true);
  result.trackButtonParameters.track1.ledMode.set("on");
  result.runtime.init();
  result.runtime.moduleParameterChanged(result.blackout);
  result.runtime.moduleParameterChanged(result.padBrightness);
  assert.equal(result.noteMessages.length, 0);
  assert.equal(result.sysexMessages.length, 0);
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  clearOutput(result);
  result.runtime.sysExEvent(introductionResponse);
  assertAllOff(result);
  clearOutput(result);

  result.isConnected.set(false);
  result.runtime.moduleParameterChanged(result.isConnected);
  result.blackout.set(false);
  result.runtime.moduleParameterChanged(result.blackout);
  result.padBrightness.set("full");
  result.runtime.moduleParameterChanged(result.padBrightness);
  assert.equal(result.noteMessages.length, 0);
  assert.equal(result.sysexMessages.length, 0);

  result.isConnected.set(true);
  result.runtime.moduleParameterChanged(result.isConnected);
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  clearOutput(result);
  result.runtime.sysExEvent(introductionResponse);
  assert.deepEqual(result.sysexMessages[0].slice(6), [56, 56, 1, 127, 1, 127, 1, 127]);
  assert.deepEqual(result.noteMessages.find((message) => message[1] === 100), [1, 100, 1]);

  clearOutput(result);
  result.blackout.set(true);
  result.runtime.moduleParameterChanged(result.blackout);
  result.isConnected.set(false);
  result.runtime.moduleParameterChanged(result.isConnected);
  result.isConnected.set(true);
  result.runtime.moduleParameterChanged(result.isConnected);
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  clearOutput(result);
  result.runtime.sysExEvent(introductionResponse);
  assertAllOff(result);
});

test("saved brightness applies on startup without a parameter change", async () => {
  const result = await createRuntime({ padBrightness: "dim" });
  result.padParameters.row1.pad11.ledEnabled.set(true);
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  clearOutput(result);
  result.runtime.sysExEvent(introductionResponse);
  assert.deepEqual(result.sysexMessages[0].slice(6), [56, 56, 0, 102, 0, 102, 0, 102]);
});

test("blackout survives initialization timeout and returning to Session Mode", async () => {
  const result = await createRuntime({ blackout: true });
  result.padParameters.row1.pad11.ledEnabled.set(true);
  result.sceneButtonParameters.scene1.ledMode.set("blink");
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  result.advanceTime(0.51);
  result.runtime.update(0.51);
  clearOutput(result);
  result.advanceTime(0.51);
  result.runtime.update(0.51);
  assertAllOff(result);
  assert.match(result.warnings[0], /Introduction did not respond/);
  clearOutput(result);

  result.runtime.sysExEvent([0x47, 0x7f, 0x4f, 0x62, 0, 1, 2]);
  result.runtime.sysExEvent([0x47, 0x7f, 0x4f, 0x62, 0, 1, 0]);
  assertAllOff(result);
});
