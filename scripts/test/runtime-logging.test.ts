import assert from "node:assert/strict";
import test from "node:test";

import { createRuntime } from "./runtime-harness.js";

test("formats pad coordinates and percentages without JUCE decimal artifacts", async () => {
  const { runtime } = await createRuntime();

  assert.equal(runtime.padLabel(37), "4.6");
  assert.equal(runtime.padLabel(56), "1.1");
  assert.equal(runtime.formatMidiValue(1), "1 (0.8%)");
  assert.equal(runtime.formatMidiValue(40), "40 (31.5%)");
  assert.equal(runtime.formatMidiValue(80), "80 (63%)");
  assert.equal(runtime.formatMidiValue(127), "127 (100%)");
});

test("keeps routine interpreted logs disabled without suppressing warnings", async () => {
  const { runtime, logs, warnings } = await createRuntime();
  runtime.init();

  runtime.noteOnEvent(1, 56, 127);
  runtime.ccEvent(1, 48, 40);
  runtime.sysExEvent([0x47, 0x7f, 0x4f, 0x62, 0x00, 0x01, 2]);

  assert.deepEqual(logs, []);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Drum Mode is not supported/);
});

test("logs interpreted pads, buttons, faders, modes, and unknown input", async () => {
  const { runtime, logs } = await createRuntime({ logInterpretedInput: true });
  runtime.init();

  runtime.noteOnEvent(1, 56, 127);
  runtime.noteOffEvent(1, 56, 0);
  runtime.noteOnEvent(1, 100, 127);
  runtime.noteOffEvent(1, 100, 0);
  runtime.noteOnEvent(1, 122, 127);
  runtime.noteOffEvent(1, 122, 0);
  runtime.ccEvent(1, 48, 40);
  runtime.ccEvent(1, 48, 40);
  runtime.ccEvent(1, 48, 41);
  runtime.sysExEvent([0x47, 0x7f, 0x4f, 0x62, 0x00, 0x01, 1]);
  runtime.noteOnEvent(3, 42, 99);
  runtime.ccEvent(1, 12, 34);
  runtime.sysExEvent([0x47, 0x7f, 0x4f, 99]);

  assert.deepEqual(logs, [
    "Pad Pressed: 1.1",
    "Pad Released: 1.1",
    "Button Pressed: Track 1",
    "Button Released: Track 1",
    "Shift Pressed",
    "Shift Released",
    "Fader Changed: Fader 1 = 40 (31.5%)",
    "Fader Changed: Fader 1 = 41 (32.3%)",
    "Pad Mode Changed: Note",
    "Unrecognized Input: Note On, channel 3, note 42, velocity 99",
    "Unrecognized Input: Control Change, channel 1, CC 12, value 34",
    "Unrecognized Input: SysEx, 4 bytes, message ID 99"
  ]);
});

test("logs the first fader event again after input logging is re-enabled", async () => {
  const { runtime, logs, logInterpretedInput } = await createRuntime({
    logInterpretedInput: true
  });
  runtime.init();

  runtime.ccEvent(1, 48, 40);
  logInterpretedInput.set(false);
  runtime.moduleParameterChanged(logInterpretedInput);
  logInterpretedInput.set(true);
  runtime.moduleParameterChanged(logInterpretedInput);
  runtime.ccEvent(1, 48, 40);

  assert.deepEqual(logs, [
    "Fader Changed: Fader 1 = 40 (31.5%)",
    "Fader Changed: Fader 1 = 40 (31.5%)"
  ]);
});

test("logs handshake input as semantic summaries without per-fader duplicates", async () => {
  const { runtime, advanceTime, logs } = await createRuntime({
    logInterpretedInput: true,
    logInterpretedOutput: true
  });
  runtime.init();
  logs.length = 0;

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
    64, 0, 16, 32, 48, 80, 96, 112, 127
  ]);

  assert.deepEqual(logs, [
    "Identity Request Sent",
    "Identity Reply: APC Mini mkII, software revision bytes [0, 1, 0, 0], device ID 127",
    "Introduction Request Sent: attempt 1",
    "Introduction Response: all faders returned 127; retrying",
    "Introduction Request Sent: attempt 2",
    "Introduction Complete: Fader 1 = 64 (50.4%), Fader 2 = 0 (0%), "
      + "Fader 3 = 16 (12.6%), Fader 4 = 32 (25.2%), Fader 5 = 48 (37.8%), "
      + "Fader 6 = 80 (63%), Fader 7 = 96 (75.6%), Fader 8 = 112 (88.2%), "
      + "Master Fader = 127 (100%)",
    "Full Resync Sent: 64 pad LEDs, 16 button LEDs"
  ]);
});

test("logs outgoing handshake and MIDI Clock configuration", async () => {
  const { runtime, advanceTime, logs, bpm, sendClock } = await createRuntime({
    logInterpretedOutput: true
  });
  runtime.init();
  assert.deepEqual(logs, ["MIDI Clock Enabled: 120 BPM"]);

  advanceTime(0.11);
  runtime.update(0.11);
  bpm.set(128);
  runtime.moduleParameterChanged(bpm);
  sendClock.set(false);
  runtime.moduleParameterChanged(sendClock);

  assert.deepEqual(logs, [
    "MIDI Clock Enabled: 120 BPM",
    "Identity Request Sent",
    "Introduction Request Sent: attempt 1",
    "MIDI Clock BPM Changed: 128",
    "MIDI Clock Disabled"
  ]);
});
