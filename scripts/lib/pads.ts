import { container, entries, type Definition } from "./schema.js";
import { pressedValue } from "./values.js";

export const PAD_ROW_COUNT = 8;
export const PAD_COLUMN_COUNT = 8;

const paletteModes = {
  "Solid - 100%": "solid100",
  "Solid - 10%": "solid10",
  "Solid - 25%": "solid25",
  "Solid - 50%": "solid50",
  "Solid - 65%": "solid65",
  "Solid - 75%": "solid75",
  "Solid - 90%": "solid90",
  "Pulse - 1/16": "pulse16",
  "Pulse - 1/8": "pulse8",
  "Pulse - 1/4": "pulse4",
  "Pulse - 1/2": "pulse2",
  "Blink - 1/24": "blink24",
  "Blink - 1/16": "blink16",
  "Blink - 1/8": "blink8",
  "Blink - 1/4": "blink4",
  "Blink - 1/2": "blink2"
} as const;

function padParameter(row: number, column: number): Definition {
  const padName = `Pad ${row}.${column}`;

  return container({
    "LED Enabled": {
      type: "Boolean",
      shortName: "ledEnabled",
      default: false,
      description: `Turns ${padName}'s LED on without discarding its color or mode.`
    },
    "Color Mode": {
      type: "Enum",
      shortName: "colorMode",
      default: "Exact RGB",
      options: {
        "Exact RGB": "rgb",
        "Hardware Palette": "palette"
      },
      description: "Exact RGB uses SysEx. Hardware Palette selects the nearest native color and supports hardware LED modes."
    },
    Color: {
      type: "Color",
      shortName: "color",
      default: [1, 1, 1, 1],
      description: "Desired pad color. Palette mode automatically selects the nearest hardware color."
    },
    "Palette Mode": {
      type: "Enum",
      shortName: "paletteMode",
      default: "Solid - 100%",
      enabled: false,
      options: paletteModes,
      dependency: {
        source: "colorMode",
        value: "palette",
        check: "equals",
        action: "enable"
      },
      description: "Native brightness or clock-synchronized pulse/blink behavior. Available in Hardware Palette mode."
    }
  });
}

export function padParameters(): Definition {
  return entries(PAD_ROW_COUNT, (row) => [
    `Row ${row}`,
    container(
      entries(PAD_COLUMN_COUNT, (column) => [
        `Pad ${row}.${column}`,
        padParameter(row, column)
      ])
    )
  ]);
}

export function padValues(): Definition {
  return entries(PAD_ROW_COUNT, (row) => [
    `Row ${row}`,
    container(
      entries(PAD_COLUMN_COUNT, (column) => [
        `Pad ${row}.${column}`,
        container({
          "Is Pressed": pressedValue(`Whether Pad ${row}.${column} is currently held.`)
        })
      ])
    )
  ]);
}
