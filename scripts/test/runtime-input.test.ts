import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

test("maps Session pads from hardware notes to top-to-bottom UI rows", async () => {
  const { runtime, pads, padMode } = await createRuntime();
  runtime.init();

  for (let note = 0; note < 64; note += 1) {
    const row = 8 - Math.floor(note / 8);
    const column = note % 8 + 1;
    const pad = pads[`row${row}`][`pad${row}${column}`];

    runtime.noteOnEvent(1, note, 127);
    assert.equal(pad.isPressed.get(), true, `note ${note} should press Pad ${row}.${column}`);
    runtime.noteOffEvent(1, note, 0);
    assert.equal(pad.isPressed.get(), false, `note ${note} should release Pad ${row}.${column}`);
  }

  assert.equal(padMode.get(), "session");

  runtime.noteOnEvent(2, 56, 127);
  assert.equal(pads.row1.pad11.isPressed.get(), false);
});

test("maps Track, Scene, Shift, and fader input", async () => {
  const { runtime, trackButtons, sceneButtons, shift, faders } = await createRuntime();
  runtime.init();

  runtime.noteOnEvent(1, 100, 127);
  runtime.noteOnEvent(1, 119, 127);
  runtime.noteOnEvent(1, 122, 127);
  assert.equal(trackButtons.track1.isPressed.get(), true);
  assert.equal(sceneButtons.scene8.isPressed.get(), true);
  assert.equal(shift.get(), true);

  runtime.noteOffEvent(1, 100, 0);
  runtime.noteOnEvent(1, 119, 0);
  runtime.noteOffEvent(1, 122, 0);
  assert.equal(trackButtons.track1.isPressed.get(), false);
  assert.equal(sceneButtons.scene8.isPressed.get(), false);
  assert.equal(shift.get(), false);

  runtime.ccEvent(1, 48, 64);
  runtime.ccEvent(1, 56, 127);
  assert.equal(faders.fader1.position.get(), 64 / 127);
  assert.equal(faders.masterFader.position.get(), 1);

  runtime.ccEvent(2, 48, 127);
  assert.equal(faders.fader1.position.get(), 64 / 127);
});

test("resets held controls after input disconnect but retains faders", async () => {
  const { runtime, devices, pads, trackButtons, shift, faders } = await createRuntime();
  runtime.init();
  runtime.noteOnEvent(1, 56, 127);
  runtime.noteOnEvent(1, 100, 127);
  runtime.noteOnEvent(1, 122, 127);
  runtime.ccEvent(1, 48, 100);

  devices.set(["", "APC mini mk2 Control"]);
  runtime.moduleParameterChanged(devices);

  assert.equal(pads.row1.pad11.isPressed.get(), false);
  assert.equal(trackButtons.track1.isPressed.get(), false);
  assert.equal(shift.get(), false);
  assert.equal(faders.fader1.position.get(), 100 / 127);
});
