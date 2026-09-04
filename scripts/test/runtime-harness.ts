import { readFile } from "node:fs/promises";
import vm from "node:vm";

export type MockParameter<T> = {
  get(): T;
  getControlAddress(): string;
  is(other: MockParameter<unknown>): boolean;
  set(value: T): void;
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
  decodePadMode(data: number[]): string;
  decodeIntroductionFaders(data: number[]): number[];
  padLabel(note: number): string;
  formatMidiValue(value: number): string;
};

let nextParameterId = 0;

export function parameter<T>(initialValue: T): MockParameter<T> {
  let value = initialValue;
  const controlAddress = `/test/parameter${nextParameterId}`;
  nextParameterId += 1;

  return {
    get: () => value,
    getControlAddress: () => controlAddress,
    is: (other) => other.getControlAddress() === controlAddress,
    set: (nextValue) => {
      value = nextValue;
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
};

export async function createRuntime(options: RuntimeOptions = {}) {
  const runtimeSource = await readFile(
    new URL("../../runtime/apc-mini-mkii.js", import.meta.url),
    "utf8"
  );
  const warnings: string[] = [];
  const logs: string[] = [];
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

  type PressedControl = MockContainer<{ isPressed: MockParameter<boolean> }>;
  type PadRow = MockContainer<Record<string, PressedControl>>;
  type FaderControl = MockContainer<{ position: MockParameter<number> }>;

  const pads: Record<string, PadRow> = {};
  for (let row = 1; row <= 8; row += 1) {
    const rowControls: Record<string, PressedControl> = {};
    for (let column = 1; column <= 8; column += 1) {
      rowControls[`pad${row}${column}`] = container({ isPressed: parameter(false) });
    }
    pads[`row${row}`] = container(rowControls);
  }

  const trackButtons: Record<string, PressedControl> = {};
  const sceneButtons: Record<string, PressedControl> = {};
  for (let index = 1; index <= 8; index += 1) {
    trackButtons[`track${index}`] = container({ isPressed: parameter(false) });
    sceneButtons[`scene${index}`] = container({ isPressed: parameter(false) });
  }

  const faders: Record<string, FaderControl> = {};
  for (let index = 1; index <= 8; index += 1) {
    faders[`fader${index}`] = container({ position: parameter(0) });
  }
  faders.masterFader = container({ position: parameter(0) });

  const padMode = parameter("unknown");
  const shift = container({ isPressed: parameter(false) });
  const values = container({
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
    logging: container({ logInterpretedInput, logInterpretedOutput })
  });
  let runtime: RuntimeFunctions;
  const context = vm.createContext({
    local: {
      parameters,
      values,
      sendSysex: (...message: number[]) => {
        sysexMessages.push(message);
        if (options.introductionResponseOnSend) {
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
    trackButtons,
    sceneButtons,
    shift: shift.isPressed,
    faders,
    sysexMessages,
    logs,
    warnings,
    logInterpretedInput,
    logInterpretedOutput,
    sendClock,
    bpm,
    enableLog,
    getUpdateRate: () => updateRate,
    advanceTime: (seconds: number) => {
      currentTime += seconds;
    }
  };
}
