import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

test("requests initialization and applies all returned fader positions", async () => {
  const { runtime, advanceTime, sysexMessages, faders, warnings, getUpdateRate, enableLog } =
    await createRuntime();
  runtime.init();
  assert.equal(getUpdateRate(), 20);
  assert.equal(enableLog.get(), true);

  advanceTime(0.11);
  runtime.update(0.11);
  assert.deepEqual(sysexMessages, [[
    0x47, 0x7f, 0x4f, 0x60, 0x00, 0x04, 0x00, 0x00, 0x01, 0x00
  ]]);

  runtime.sysExEvent([
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    0, 16, 32, 48, 64, 80, 96, 112, 127
  ]);

  assert.equal(faders.fader1.position.get(), 0);
  assert.equal(faders.fader5.position.get(), 64 / 127);
  assert.equal(faders.masterFader.position.get(), 1);

  advanceTime(2);
  runtime.update(2);
  assert.deepEqual(warnings, []);
});

test("warns after an initialization timeout without disabling live input", async () => {
  const { runtime, advanceTime, warnings, pads, sysexMessages } = await createRuntime();
  runtime.init();
  advanceTime(0.11);
  runtime.update(0.11);
  advanceTime(0.51);
  runtime.update(0.51);
  advanceTime(0.51);
  runtime.update(0.51);

  assert.equal(sysexMessages.length, 2);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /initial fader positions may be unknown/);

  runtime.noteOnEvent(1, 56, 127);
  assert.equal(pads.row1.pad11.isPressed.get(), true);
});

test("does not schedule initialization with only one selected endpoint", async () => {
  const inputOnly = await createRuntime({
    connected: true,
    devices: ["20-0", ""]
  });
  inputOnly.runtime.init();
  inputOnly.advanceTime(0.11);
  inputOnly.runtime.update(0.11);
  inputOnly.advanceTime(2);
  inputOnly.runtime.update(2);

  assert.deepEqual(inputOnly.sysexMessages, []);
  assert.equal(inputOnly.warnings.length, 1);
  assert.match(inputOnly.warnings[0], /MIDI output is not selected/);
  inputOnly.runtime.noteOnEvent(1, 56, 127);
  assert.equal(inputOnly.pads.row1.pad11.isPressed.get(), true);
  inputOnly.runtime.moduleParameterChanged(inputOnly.devices);
  assert.equal(inputOnly.warnings.length, 1);

  const outputOnly = await createRuntime({
    connected: true,
    devices: ["", "20-0"]
  });
  outputOnly.runtime.init();
  outputOnly.advanceTime(0.11);
  outputOnly.runtime.update(0.11);
  outputOnly.advanceTime(2);
  outputOnly.runtime.update(2);

  assert.deepEqual(outputOnly.sysexMessages, []);
  assert.equal(outputOnly.warnings.length, 1);
  assert.match(outputOnly.warnings[0], /MIDI input is not selected/);
  outputOnly.runtime.moduleParameterChanged(outputOnly.devices);
  assert.equal(outputOnly.warnings.length, 1);
});

test("remains quiet when neither MIDI endpoint is selected", async () => {
  const result = await createRuntime({
    connected: false,
    devices: ["", ""]
  });
  result.runtime.init();
  result.advanceTime(2);
  result.runtime.update(2);

  assert.deepEqual(result.sysexMessages, []);
  assert.deepEqual(result.warnings, []);
});

test("treats Chataigne's invalid initial MIDI description as no input", async () => {
  const result = await createRuntime({
    connected: false,
    devices: ["MIDI Devices to connect to", "", ""]
  });
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);

  assert.deepEqual(result.sysexMessages, []);
  assert.deepEqual(result.warnings, []);
});

test("warns again when an incomplete configuration recurs after being cleared", async () => {
  const result = await createRuntime({
    connected: true,
    devices: ["20-0", ""]
  });
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  assert.equal(result.warnings.length, 1);

  result.devices.set(["", ""]);
  result.runtime.moduleParameterChanged(result.devices);
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  assert.equal(result.warnings.length, 1);

  result.devices.set(["20-0", ""]);
  result.runtime.moduleParameterChanged(result.devices);
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  assert.equal(result.warnings.length, 2);
  assert.match(result.warnings[1], /MIDI output is not selected/);
});

test("accepts opaque device IDs without guessing their display names", async () => {
  const result = await createRuntime({
    connected: true,
    devices: ["virtual-in", "virtual-out"]
  });
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);

  assert.deepEqual(result.warnings, []);
  assert.equal(result.sysexMessages.length, 1);
});

test("recognizes Notes when a platform includes its name in the raw ID", async () => {
  const result = await createRuntime({
    connected: true,
    devices: ["aPc MiNi Mk2 NoTeS", "APC MINI MK2 CONTROL"]
  });
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);

  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /Notes port is not supported/);
  assert.deepEqual(result.sysexMessages, []);
});

test("reads endpoint IDs only after Chataigne's device state settles", async () => {
  const result = await createRuntime({
    connected: false,
    devices: ["", ""]
  });
  result.runtime.init();

  // Chataigne notifies scripts while its MIDI module is still closing and
  // reopening endpoints. The final state may arrive without another useful
  // script callback, so only evaluate it after the debounce.
  result.devices.set(["stale-input", ""]);
  result.runtime.moduleParameterChanged(result.devices);
  result.isConnected.set(true);
  result.runtime.moduleParameterChanged(result.isConnected);

  result.devices.set(["20-0", "20-0"]);
  result.advanceTime(0.11);
  result.runtime.update(0.11);

  assert.deepEqual(result.warnings, []);
  assert.equal(result.sysexMessages.length, 1);
});

test("reports the final missing endpoint after live selector changes", async () => {
  const result = await createRuntime({
    connected: false,
    devices: ["", ""]
  });
  result.runtime.init();
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  assert.deepEqual(result.warnings, []);

  result.devices.set(["", "20-0"]);
  result.isConnected.set(true);
  result.runtime.moduleParameterChanged(result.devices);
  result.runtime.moduleParameterChanged(result.isConnected);
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  assert.match(result.warnings[0], /MIDI input is not selected/);
  assert.deepEqual(result.sysexMessages, []);

  result.devices.set(["20-0", ""]);
  result.runtime.moduleParameterChanged(result.devices);
  result.advanceTime(0.11);
  result.runtime.update(0.11);
  assert.match(result.warnings[1], /MIDI output is not selected/);
  assert.deepEqual(result.sysexMessages, []);
});

test("retries a missing Introduction response after 500 ms", async () => {
  const result = await createRuntime({ logInterpretedOutput: true });
  result.runtime.init();

  result.advanceTime(0.11);
  result.runtime.update(0.11);
  assert.equal(result.sysexMessages.length, 1);

  result.advanceTime(0.49);
  result.runtime.update(0.49);
  assert.equal(result.sysexMessages.length, 1);

  result.advanceTime(0.02);
  result.runtime.update(0.02);
  assert.equal(result.sysexMessages.length, 2);
  assert.deepEqual(result.logs.slice(-2), [
    "Initialization Request Sent: attempt 1",
    "Initialization Request Sent: attempt 2"
  ]);

  result.advanceTime(0.51);
  result.runtime.update(0.51);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /did not respond to initialization/);
});

test("does not lose an immediate Introduction response", async () => {
  const response = [
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    0, 16, 32, 48, 64, 80, 96, 112, 127
  ];
  const { runtime, advanceTime, warnings, faders } = await createRuntime({
    introductionResponseOnSend: response
  });

  runtime.init();
  advanceTime(0.11);
  runtime.update(0.11);
  advanceTime(2);
  runtime.update(2);

  assert.deepEqual(warnings, []);
  assert.equal(faders.fader5.position.get(), 64 / 127);
  assert.equal(faders.masterFader.position.get(), 1);
});

test("retries an all-127 snapshot and applies a subsequent physical snapshot", async () => {
  const { runtime, advanceTime, sysexMessages, faders, warnings } = await createRuntime();
  runtime.init();

  advanceTime(0.11);
  runtime.update(0.11);
  runtime.sysExEvent([
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    127, 127, 127, 127, 127, 127, 127, 127, 127
  ]);

  advanceTime(0.11);
  runtime.update(0.11);
  assert.equal(sysexMessages.length, 2);

  runtime.sysExEvent([
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    64, 0, 0, 0, 0, 0, 0, 0, 0
  ]);

  assert.equal(faders.fader1.position.get(), 64 / 127);
  assert.equal(faders.fader2.position.get(), 0);
  assert.deepEqual(warnings, []);
});

test("retains live positions when both initialization snapshots are all 127", async () => {
  const { runtime, advanceTime, faders, warnings } = await createRuntime();
  runtime.init();
  runtime.ccEvent(1, 48, 64);
  runtime.ccEvent(1, 49, 0);

  advanceTime(0.11);
  runtime.update(0.11);
  runtime.sysExEvent([
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    127, 127, 127, 127, 127, 127, 127, 127, 127
  ]);
  advanceTime(0.11);
  runtime.update(0.11);
  runtime.sysExEvent([
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    127, 127, 127, 127, 127, 127, 127, 127, 127
  ]);

  assert.equal(faders.fader1.position.get(), 64 / 127);
  assert.equal(faders.fader2.position.get(), 0);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Keeping the last known positions/);
});
