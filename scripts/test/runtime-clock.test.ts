import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

test("starts Chataigne's inherited MIDI clock after device initialization", async () => {
  const { runtime, advanceTime, midiBpm, midiSendClock } = await createRuntime({
    bpm: 135,
    sendClock: true,
    inheritedBpm: 135,
    inheritedSendClock: true
  });

  runtime.init();

  assert.equal(midiBpm.get(), 135);
  assert.equal(midiSendClock.get(), false);
  assert.equal(midiBpm.attributes.readOnly, true);
  assert.equal(midiSendClock.attributes.readOnly, true);

  advanceTime(0.11);
  runtime.update(0.11);
  runtime.sysExEvent([
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    0, 16, 32, 48, 64, 80, 96, 112, 126
  ]);

  assert.equal(midiBpm.get(), 135);
  assert.equal(midiSendClock.get(), true);
  assert.deepEqual(midiSendClock.setHistory, [false, true]);
});

test("mirrors live BPM and Send Clock changes to Chataigne's MIDI sender", async () => {
  const { runtime, advanceTime, bpm, sendClock, midiBpm, midiSendClock } =
    await createRuntime();
  runtime.init();
  advanceTime(0.11);
  runtime.update(0.11);
  runtime.sysExEvent([
    0x47, 0x7f, 0x4f, 0x61, 0x00, 0x04,
    0, 16, 32, 48, 64, 80, 96, 112, 126
  ]);

  bpm.set(90);
  runtime.moduleParameterChanged(bpm);
  assert.equal(midiBpm.get(), 90);
  assert.equal(midiSendClock.get(), true);

  sendClock.set(false);
  runtime.moduleParameterChanged(sendClock);
  assert.equal(midiSendClock.get(), false);

  bpm.set(180);
  runtime.moduleParameterChanged(bpm);
  assert.equal(midiBpm.get(), 180);

  sendClock.set(true);
  runtime.moduleParameterChanged(sendClock);
  assert.equal(midiSendClock.get(), true);
  assert.equal(midiBpm.get(), 180);
});

test("starts the MIDI clock after the bounded initialization timeout", async () => {
  const { runtime, advanceTime, midiSendClock } = await createRuntime();
  runtime.init();

  advanceTime(0.11);
  runtime.update(0.11);
  assert.equal(midiSendClock.get(), false);

  advanceTime(0.51);
  runtime.update(0.51);
  assert.equal(midiSendClock.get(), false);

  advanceTime(0.51);
  runtime.update(0.51);
  assert.equal(midiSendClock.get(), true);
});
