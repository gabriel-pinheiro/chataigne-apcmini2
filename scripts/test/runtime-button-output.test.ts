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

test("sends Track and Scene LED modes immediately using their native notes", async () => {
  const result = await createReadyRuntime(true);
  result.noteMessages.length = 0;
  result.logs.length = 0;

  const track1 = result.trackButtonParameters.track1.ledMode;
  track1.set("on");
  result.runtime.moduleParameterChanged(track1);

  const scene8 = result.sceneButtonParameters.scene8.ledMode;
  scene8.set("blink");
  result.runtime.moduleParameterChanged(scene8);

  track1.set("off");
  result.runtime.moduleParameterChanged(track1);

  assert.deepEqual(result.noteMessages, [
    [1, 100, 1],
    [1, 119, 2],
    [1, 100, 0]
  ]);
  assert.deepEqual(result.logs, [
    "Button LED Updated: Track 1 = On",
    "Button LED Updated: Scene 8 = Blink",
    "Button LED Updated: Track 1 = Off"
  ]);
});

test("suppresses button output while initializing and resyncs the latest state", async () => {
  const result = await createRuntime({ logInterpretedOutput: true });
  result.runtime.init();

  const track3 = result.trackButtonParameters.track3.ledMode;
  track3.set("blink");
  result.runtime.moduleParameterChanged(track3);
  const scene4 = result.sceneButtonParameters.scene4.ledMode;
  scene4.set("on");
  result.runtime.moduleParameterChanged(scene4);

  assert.deepEqual(result.noteMessages, []);

  result.advanceTime(0.11);
  result.runtime.update(0.11);
  result.runtime.sysExEvent(introductionResponse);

  const buttonMessages = result.noteMessages.filter((message) => message[1] >= 100);
  assert.equal(buttonMessages.length, 16);
  assert.deepEqual(buttonMessages, [
    [1, 100, 0], [1, 101, 0], [1, 102, 2], [1, 103, 0],
    [1, 104, 0], [1, 105, 0], [1, 106, 0], [1, 107, 0],
    [1, 112, 0], [1, 113, 0], [1, 114, 0], [1, 115, 1],
    [1, 116, 0], [1, 117, 0], [1, 118, 0], [1, 119, 0]
  ]);
  assert.equal(result.logs.at(-1), "Full Resync Sent: 64 pad LEDs, 16 button LEDs");
  assert.equal(result.logs.filter((line) => line.startsWith("Button LED Updated")).length, 0);
});

test("includes all button LEDs in a manual Full Resync", async () => {
  const result = await createReadyRuntime(true);
  result.noteMessages.length = 0;
  result.logs.length = 0;

  result.trackButtonParameters.track8.ledMode.set("on");
  result.sceneButtonParameters.scene1.ledMode.set("blink");
  result.runtime.fullResync();

  const buttonMessages = result.noteMessages.filter((message) => message[1] >= 100);
  assert.equal(result.noteMessages.length, 80);
  assert.equal(buttonMessages.length, 16);
  assert.deepEqual(buttonMessages[7], [1, 107, 1]);
  assert.deepEqual(buttonMessages[8], [1, 112, 2]);
  assert.deepEqual(result.logs, ["Full Resync Sent: 64 pad LEDs, 16 button LEDs"]);
});
