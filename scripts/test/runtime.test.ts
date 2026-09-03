import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

type Parameter<T> = {
  get(): T;
  getControlAddress(): string;
  set(value: T): void;
  setAttribute(name: string, value: boolean | number | string): void;
  attributes: Record<string, boolean | number | string>;
};

let nextParameterId = 0;

function parameter<T>(initialValue: T): Parameter<T> {
  let value = initialValue;
  const controlAddress = `/test/parameter${nextParameterId}`;
  const attributes: Record<string, boolean | number | string> = {};
  nextParameterId += 1;

  return {
    get: () => value,
    getControlAddress: () => controlAddress,
    set: (nextValue) => {
      value = nextValue;
    },
    setAttribute: (name, attributeValue) => {
      attributes[name] = attributeValue;
    },
    attributes
  };
}

async function createRuntime() {
  const runtimeSource = await readFile(
    new URL("../../runtime/apc-mini-mkii.js", import.meta.url),
    "utf8"
  );
  const noteMessages: number[][] = [];
  const sysexMessages: number[][] = [];
  const logs: string[] = [];
  const moduleClock = {
    sendClock: parameter(true),
    bpm: parameter(120)
  };
  const midiClock = {
    sendClock: parameter(false),
    bpm: parameter(0)
  };
  const pad = {
    ledEnabled: parameter(true),
    colorMode: parameter("palette"),
    color: parameter([1, 0, 0, 1]),
    paletteMode: parameter("blink4")
  };
  const devices = parameter(["APC mini mk2 Control", "APC mini mk2 Control"]);
  const context = vm.createContext({
    local: {
      parameters: {
        clock: moduleClock,
        devices,
        pads: { row1: { pad11: pad } }
      },
      values: { tempo: midiClock },
      sendNoteOn: (...message: number[]) => noteMessages.push(message),
      sendSysex: (...message: number[]) => sysexMessages.push(message)
    },
    script: { log: (message: string) => logs.push(message) }
  });

  vm.runInContext(runtimeSource, context);

  return {
    context: context as typeof context & {
      nearestPaletteIndex(color: number[]): number;
      paletteModeChannel(mode: string): number;
      splitByte(value: number): number[];
      init(): void;
      moduleParameterChanged(changedParameter: Parameter<unknown>): void;
    },
    midiClock,
    logs,
    moduleClock,
    noteMessages
  };
}

test("encodes palette modes and RGB bytes for Chataigne", async () => {
  const { context } = await createRuntime();

  assert.equal(context.paletteModeChannel("solid10"), 1);
  assert.equal(context.paletteModeChannel("Solid - 100%"), 7);
  assert.equal(context.paletteModeChannel("blink4"), 15);
  assert.equal(context.paletteModeChannel("Pulse - 1/2"), 11);
  assert.deepEqual(Array.from(context.splitByte(255)), [1, 127]);
  assert.equal(context.nearestPaletteIndex([1, 0, 0, 1]), 5);
});

test("does not emit JavaScript patterns unsupported by Chataigne", async () => {
  const runtimeSource = await readFile(
    new URL("../../runtime/apc-mini-mkii.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(runtimeSource, /^\s*\w+\.\w+\s*=/m);
  assert.doesNotMatch(runtimeSource, /\.substr\s*\(/);
  assert.doesNotMatch(runtimeSource, /\bswitch\s*\(/);
  assert.doesNotMatch(runtimeSource, /Number\.MAX_VALUE/);
});

test("initializes the inherited MIDI clock from our controls", async () => {
  const { context, midiClock, moduleClock } = await createRuntime();

  context.init();

  assert.equal(midiClock.bpm.get(), 120);
  assert.equal(midiClock.sendClock.get(), true);
  assert.equal(midiClock.bpm.attributes.readOnly, true);
  assert.equal(midiClock.sendClock.attributes.readOnly, true);

  moduleClock.bpm.set(90);
  context.moduleParameterChanged({
    getControlAddress: moduleClock.bpm.getControlAddress
  } as Parameter<unknown>);
  assert.equal(midiClock.bpm.get(), 90);
});

test("renders Pad 1.1 with the selected hardware blink mode", async () => {
  const { context, logs, noteMessages } = await createRuntime();

  context.init();

  assert.deepEqual(noteMessages, [[15, 56, 5]]);
  assert.match(logs.at(-1) ?? "", /paletteMode=blink4, channel=15, paletteIndex=5/);
});
