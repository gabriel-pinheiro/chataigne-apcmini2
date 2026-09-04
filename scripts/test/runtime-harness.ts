import { readFile } from "node:fs/promises";
import vm from "node:vm";

export type MockParameter<T> = {
  attributes: Record<string, boolean | number | string>;
  setHistory: T[];
  get(): T;
  getControlAddress(): string;
  is(other: MockParameter<unknown>): boolean;
  set(value: T): void;
  setAttribute(name: string, value: boolean | number | string): void;
  setData(value: string): void;
};

export type RuntimeFunctions = {
  init(): void;
  update(deltaTime: number): void;
  noteOnEvent(channel: number, pitch: number, velocity: number): void;
  noteOffEvent(channel: number, pitch: number, velocity: number): void;
  ccEvent(channel: number, number: number, value: number): void;
  sysExEvent(data: number[]): void;
  moduleParameterChanged(parameter: MockParameter<unknown>): void;
  fullResync(): void;
  decodePadMode(data: number[]): string;
  decodeIntroductionFaders(data: number[]): number[];
  nearestHardwarePaletteIndex(rgb: number[]): number;
  hardwarePaletteRgb(index: number): number[];
  effectiveColorRgb(color: [number, number, number, number]): number[];
  padLabel(note: number): string;
  formatMidiValue(value: number): string;
};

let nextParameterId = 0;

export function parameter<T>(initialValue: T): MockParameter<T> {
  let value = initialValue;
  const controlAddress = `/test/parameter${nextParameterId}`;
  const attributes: Record<string, boolean | number | string> = {};
  const setHistory: T[] = [];
  nextParameterId += 1;

  return {
    attributes,
    setHistory,
    get: () => value,
    getControlAddress: () => controlAddress,
    is: (other) => other.getControlAddress() === controlAddress,
    set: (nextValue) => {
      value = nextValue;
      setHistory.push(nextValue);
    },
    setAttribute: (name, attributeValue) => {
      attributes[name] = attributeValue;
    },
    setData: (nextValue) => {
      value = nextValue as T;
    }
  };
}

type MockContainer<T extends Record<string, unknown>> = T & {
  getChild(shortName: string): unknown;
};

function container<T extends Record<string, unknown>>(children: T): MockContainer<T> {
  return Object.assign(children, {
    getChild: (shortName: string) => children[shortName]
  });
}

type RuntimeOptions = {
  connected?: boolean;
  devices?: string[];
  introductionResponseOnSend?: number[];
  logInterpretedInput?: boolean;
  logInterpretedOutput?: boolean;
  sendClock?: boolean;
  bpm?: number;
  inheritedSendClock?: boolean;
  inheritedBpm?: number;
};

export async function createRuntime(options: RuntimeOptions = {}) {
  const runtimeSource = await readFile(
    new URL("../../runtime/apc-mini-mkii.js", import.meta.url),
    "utf8"
  );
  const warnings: string[] = [];
  const logs: string[] = [];
  const noteMessages: number[][] = [];
  const sysexMessages: number[][] = [];
  let currentTime = 0;
  let updateRate = 0;
  const enableLog = parameter(false);

  const devices = parameter(
    options.devices ?? ["APC mini mk2 Control", "APC mini mk2 Control"]
  );
  const isConnected = parameter(options.connected ?? true);
  const logInterpretedInput = parameter(options.logInterpretedInput ?? false);
  const logInterpretedOutput = parameter(options.logInterpretedOutput ?? false);
  const sendClock = parameter(options.sendClock ?? true);
  const bpm = parameter(options.bpm ?? 120);
  const midiSendClock = parameter(options.inheritedSendClock ?? false);
  const midiBpm = parameter(options.inheritedBpm ?? 0);

  type PressedControl = MockContainer<{ isPressed: MockParameter<boolean> }>;
  type PadRow = MockContainer<Record<string, PressedControl>>;
  type PadParameterControl = MockContainer<{
    ledEnabled: MockParameter<boolean>;
    colorMode: MockParameter<string>;
    color: MockParameter<[number, number, number, number]>;
    paletteMode: MockParameter<string>;
  }>;
  type PadParameterRow = MockContainer<Record<string, PadParameterControl>>;
  type ButtonParameterControl = MockContainer<{
    ledMode: MockParameter<string>;
  }>;
  type FaderControl = MockContainer<{ position: MockParameter<number> }>;

  const pads: Record<string, PadRow> = {};
  const padParameters: Record<string, PadParameterRow> = {};
  for (let row = 1; row <= 8; row += 1) {
    const rowControls: Record<string, PressedControl> = {};
    const rowParameters: Record<string, PadParameterControl> = {};
    for (let column = 1; column <= 8; column += 1) {
      rowControls[`pad${row}${column}`] = container({ isPressed: parameter(false) });
      rowParameters[`pad${row}${column}`] = container({
        ledEnabled: parameter(false),
        colorMode: parameter("rgb"),
        color: parameter([1, 1, 1, 1]),
        paletteMode: parameter("solid100")
      });
    }
    pads[`row${row}`] = container(rowControls);
    padParameters[`row${row}`] = container(rowParameters);
  }

  const trackButtons: Record<string, PressedControl> = {};
  const sceneButtons: Record<string, PressedControl> = {};
  const trackButtonParameters: Record<string, ButtonParameterControl> = {};
  const sceneButtonParameters: Record<string, ButtonParameterControl> = {};
  for (let index = 1; index <= 8; index += 1) {
    trackButtons[`track${index}`] = container({ isPressed: parameter(false) });
    sceneButtons[`scene${index}`] = container({ isPressed: parameter(false) });
    trackButtonParameters[`track${index}`] = container({ ledMode: parameter("off") });
    sceneButtonParameters[`scene${index}`] = container({ ledMode: parameter("off") });
  }

  const faders: Record<string, FaderControl> = {};
  for (let index = 1; index <= 8; index += 1) {
    faders[`fader${index}`] = container({ position: parameter(0) });
  }
  faders.masterFader = container({ position: parameter(0) });

  const padMode = parameter("unknown");
  const shift = container({ isPressed: parameter(false) });
  const values = container({
    tempo: container({ sendClock: midiSendClock, bpm: midiBpm }),
    status: container({ padMode }),
    pads: container(pads),
    buttons: container({
      trackButtons: container(trackButtons),
      sceneButtons: container(sceneButtons),
      shift
    }),
    faders: container(faders)
  });
  const parameters = container({
    devices,
    isConnected,
    clock: container({ sendClock, bpm }),
    logging: container({ logInterpretedInput, logInterpretedOutput }),
    pads: container(padParameters),
    buttons: container({
      trackButtons: container(trackButtonParameters),
      sceneButtons: container(sceneButtonParameters)
    })
  });
  let runtime: RuntimeFunctions;
  const context = vm.createContext({
    local: {
      parameters,
      values,
      sendNoteOn: (...message: number[]) => {
        noteMessages.push(message);
      },
      sendSysex: (...parts: Array<number | number[]>) => {
        const message = parts.flatMap((part) => typeof part === "number" ? [part] : part);
        sysexMessages.push(message);
        if (options.introductionResponseOnSend && message[3] === 0x60) {
          runtime.sysExEvent(options.introductionResponseOnSend);
        }
      }
    },
    script: container({
      enableLog,
      log: (...values: unknown[]) => logs.push(values.map(String).join(" ")),
      logWarning: (message: string) => warnings.push(message),
      logError: (message: string) => warnings.push(message),
      setUpdateRate: (value: number) => {
        updateRate = value;
      }
    }),
    util: { getTime: () => currentTime }
  });

  vm.runInContext(runtimeSource, context);
  runtime = context as typeof context & RuntimeFunctions;

  return {
    runtime,
    devices,
    isConnected,
    padMode,
    pads,
    padParameters,
    trackButtons,
    sceneButtons,
    trackButtonParameters,
    sceneButtonParameters,
    shift: shift.isPressed,
    faders,
    noteMessages,
    sysexMessages,
    logs,
    warnings,
    logInterpretedInput,
    logInterpretedOutput,
    sendClock,
    bpm,
    midiSendClock,
    midiBpm,
    enableLog,
    getUpdateRate: () => updateRate,
    advanceTime: (seconds: number) => {
      currentTime += seconds;
    }
  };
}
