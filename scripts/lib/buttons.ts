import { container, entries, type Definition } from "./schema.js";
import { pressedValue } from "./values.js";

export const TRACK_BUTTON_COUNT = 8;
export const SCENE_BUTTON_COUNT = 8;

function peripheralLedMode(color: "red" | "green"): Definition {
  return {
    type: "Enum",
    shortName: "ledMode",
    default: "Off",
    options: {
      Off: "off",
      On: "on",
      Blink: "blink"
    },
    description: `Controls the button's single-color ${color} LED.`
  };
}

export function buttonParameters(): Definition {
  return {
    "Track Buttons": container(
      entries(TRACK_BUTTON_COUNT, (index) => [
        `Track ${index}`,
        container({ "LED Mode": peripheralLedMode("red") })
      ])
    ),
    "Scene Buttons": container(
      entries(SCENE_BUTTON_COUNT, (index) => [
        `Scene ${index}`,
        container({ "LED Mode": peripheralLedMode("green") })
      ])
    )
  };
}

export function buttonValues(): Definition {
  return {
    "Track Buttons": container(
      entries(TRACK_BUTTON_COUNT, (index) => [
        `Track ${index}`,
        container({
          "Is Pressed": pressedValue(`Whether bottom-row Track button ${index} is currently held.`)
        })
      ])
    ),
    "Scene Buttons": container(
      entries(SCENE_BUTTON_COUNT, (index) => [
        `Scene ${index}`,
        container({
          "Is Pressed": pressedValue(`Whether right-side Scene button ${index} is currently held.`)
        })
      ])
    ),
    Shift: container({
      "Is Pressed": pressedValue("Whether the Shift modifier is currently held.")
    })
  };
}
