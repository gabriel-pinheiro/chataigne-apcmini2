interface ChataigneScriptTarget {
  is(other: ChataigneScriptTarget): boolean;
}

interface ChataigneContainer extends ChataigneScriptTarget {
  getChild(nameOrAddress: string): ChataigneContainer | ChataigneParameter<unknown>;
  getControlAddress(relativeTo?: ChataigneContainer): string;
  getContainers(): ChataigneContainer[];
  getControllables(
    includeParameters?: boolean,
    includeTriggers?: boolean
  ): ChataigneParameter<unknown>[];
}

interface ChataigneParameter<T> extends ChataigneScriptTarget {
  get(): T;
  getControlAddress(relativeTo?: ChataigneContainer): string;
  getParent(level?: number): ChataigneContainer;
  isParameter(): boolean;
  set(value: T): void;
  setAttribute(name: string, value: boolean | number | string): void;
}

interface ChataigneEnumParameter extends ChataigneParameter<string> {
  getKey(): string;
  setData(value: string): void;
}

interface ChataignePressedValue extends ChataigneContainer {
  isPressed: ChataigneParameter<boolean>;
}

type PadColumn = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type PadShortName<Row extends number> = `pad${Row}${PadColumn}`;
type ChataignePadRow<Row extends number> = ChataigneContainer & {
  [Pad in PadShortName<Row>]: ChataignePressedValue;
};

interface ChataignePads extends ChataigneContainer {
  row1: ChataignePadRow<1>;
  row2: ChataignePadRow<2>;
  row3: ChataignePadRow<3>;
  row4: ChataignePadRow<4>;
  row5: ChataignePadRow<5>;
  row6: ChataignePadRow<6>;
  row7: ChataignePadRow<7>;
  row8: ChataignePadRow<8>;
}

type IndexedPressedValues<Prefix extends string> = ChataigneContainer & {
  [Index in `${Prefix}${PadColumn}`]: ChataignePressedValue;
};

interface ChataigneFaderValue extends ChataigneContainer {
  position: ChataigneParameter<number>;
}

type ChannelFaderShortName = `fader${PadColumn}`;
type ChataigneFaders = ChataigneContainer & {
  [Fader in ChannelFaderShortName]: ChataigneFaderValue;
} & {
  masterFader: ChataigneFaderValue;
};

interface ChataigneMidiDeviceParameter
  extends ChataigneParameter<[inputId: string, outputId: string]> {}

interface ChataigneLocal {
  parameters: {
    devices: ChataigneMidiDeviceParameter;
    isConnected: ChataigneParameter<boolean>;
    clock: {
      sendClock: ChataigneParameter<boolean>;
      bpm: ChataigneParameter<number>;
    };
    logging: {
      logInterpretedInput: ChataigneParameter<boolean>;
      logInterpretedOutput: ChataigneParameter<boolean>;
    };
  };
  values: {
    pads: ChataignePads;
    buttons: {
      trackButtons: IndexedPressedValues<"track">;
      sceneButtons: IndexedPressedValues<"scene">;
      shift: ChataignePressedValue;
    };
    faders: ChataigneFaders;
    status: {
      padMode: ChataigneEnumParameter;
    };
  };
  sendSysex(...data: Array<number | number[] | string | boolean>): void;
}

declare var local: ChataigneLocal;

declare var script: {
  enableLog: ChataigneParameter<boolean>;
  log(...values: unknown[]): void;
  logWarning(...values: unknown[]): void;
  logError(...values: unknown[]): void;
  setUpdateRate(updatesPerSecond: number): void;
  setExecutionTimeout(seconds: number): void;
};

declare var util: {
  getTime(): number;
};
