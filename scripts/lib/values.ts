import type { Definition } from "./schema.js";

export function pressedValue(description: string): Definition {
  return {
    type: "Boolean",
    shortName: "isPressed",
    default: false,
    readOnly: true,
    description
  };
}
