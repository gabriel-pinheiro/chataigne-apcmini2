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
  const { runtime, advanceTime, warnings, pads } = await createRuntime();
  runtime.init();
  advanceTime(0.11);
  runtime.update(0.11);
  advanceTime(1.01);
  runtime.update(1.01);

  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /initial fader positions may be unknown/);

  runtime.noteOnEvent(1, 56, 127);
  assert.equal(pads.row1.pad11.isPressed.get(), true);
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
