import { buttonParameters, buttonValues } from "./buttons.js";
import { faderValues } from "./faders.js";
import { padParameters, padValues } from "./pads.js";
import { container, type Definition } from "./schema.js";
import { statusValues } from "./status.js";

export const moduleDefinition: Definition = {
  name: "APC Mini mkII Enhanced",
  type: "MIDI",
  path: "Hardware",
  version: "0.1.0",
  description: "Enhanced Chataigne support for the Akai APC Mini mkII control surface.",
  hasInput: true,
  hasOutput: true,
  hideDefaultCommands: true,
  scripts: ["runtime/apc-mini-mkii.js"],
  defaults: {
    autoAdd: false
  },
  hideDefaultParameters: [
    "autoAdd",
    "autoFeedback",
    "useHierarchy",
    "octaveShift",
    "usePitchForNoteNames",
    "passThrough"
  ],
  commands: {
    "Full Resync": {
      menu: "",
      callback: "fullResync"
    }
  },
  parameters: {
    Clock: container(
      {
        "Send Clock": {
          type: "Boolean",
          shortName: "sendClock",
          default: true,
          description: "Send MIDI Clock to synchronize native pad pulse and blink modes. Disable when another source clocks the controller."
        },
        BPM: {
          type: "Float",
          shortName: "bpm",
          default: 120,
          min: 20,
          max: 300,
          dependency: {
            source: "sendClock",
            value: true,
            check: "equals",
            action: "enable"
          },
          description: "Tempo of the generated MIDI Clock in beats per minute."
        }
      },
      false
    ),
    Logging: container(
      {
        "Log Interpreted Input": {
          type: "Boolean",
          shortName: "logInterpretedInput",
          default: false,
          description: "Log concise, hardware-aware descriptions of incoming APC Mini mkII events."
        },
        "Log Interpreted Output": {
          type: "Boolean",
          shortName: "logInterpretedOutput",
          default: false,
          description: "Log concise, hardware-aware descriptions of outgoing APC Mini mkII operations."
        }
      },
      false
    ),
    Pads: container(padParameters(), false),
    Buttons: container(buttonParameters())
  },
  values: {
    Status: statusValues(),
    Pads: container(padValues(), false),
    Buttons: container(buttonValues()),
    Faders: container(faderValues())
  }
};
