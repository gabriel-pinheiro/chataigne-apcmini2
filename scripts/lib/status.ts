import { container, type Definition } from "./schema.js";

export function statusValues(): Definition {
  return container({
    "Pad Mode": {
      type: "Enum",
      shortName: "padMode",
      default: "Unknown",
      options: {
        Unknown: "unknown",
        Session: "session",
        Note: "note",
        Drum: "drum",
        "Note Edit": "node_edit"
      },
      readOnly: true,
      description: "Currently detected hardware pad mode. Only Session Mode is supported."
    }
  });
}
