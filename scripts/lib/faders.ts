import { container, entries, type Definition } from "./schema.js";

export const CHANNEL_FADER_COUNT = 8;

function faderValue(description: string): Definition {
  return container({
    Position: {
      type: "Float",
      shortName: "position",
      default: 0,
      min: 0,
      max: 1,
      readOnly: true,
      description
    }
  });
}

export function faderValues(): Definition {
  return {
    ...entries(CHANNEL_FADER_COUNT, (index) => [
      `Fader ${index}`,
      faderValue(`Normalized position of Fader ${index}.`)
    ]),
    "Master Fader": faderValue("Normalized position of the Master Fader.")
  };
}
