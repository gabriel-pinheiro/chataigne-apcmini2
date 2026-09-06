# APC Mini mkII Enhanced

A [Chataigne](https://benjamin.kuperberg.fr/chataigne/) module for the Akai
APC Mini mkII that exposes the controller's full protocol: every input, every
LED capability of the hardware, and a connection handshake that keeps
Chataigne and the controller in sync.

## Features

### Complete input

- All 64 Session Mode pads, grouped by row.
- Eight Track buttons, eight Scene buttons, and Shift.
- Eight channel faders and the Master Fader, normalized to `0–1`.
- Fader positions are read from the controller as soon as it connects, so
  values are correct before anyone touches a fader.
- Held pads and buttons reset when the controller disconnects, so a project
  never gets stuck with a phantom press.

### Two color engines for every pad

Each pad chooses between two independent color modes:

- **Exact RGB** sends the precise 24-bit color you pick through SysEx. Use it
  when the color matters more than animation.
- **Hardware Palette** picks the nearest of the controller's 128 native colors
  and unlocks the hardware's built-in LED behaviors:
  - seven solid brightness levels: 10%, 25%, 50%, 65%, 75%, 90%, and 100%;
  - four pulse rates: 1/16, 1/8, 1/4, and 1/2;
  - five blink rates: 1/24, 1/16, 1/8, 1/4, and 1/2.

Pulse and blink run on the controller itself. Nothing is streamed from
Chataigne to animate them, so they stay smooth regardless of project load.

### Global LED controls

- **Blackout** turns every pad and button LED off in one step without
  touching individual settings, and restores them when released.
- **Pad Brightness** dims all pads to 40% while leaving the Track and Scene
  LEDs untouched.
- A color's alpha channel acts as a per-pad brightness multiplier in both
  color modes.

### Track and Scene LEDs

Every Track and Scene button LED supports its native Off, On, and Blink modes.

### Built-in MIDI Clock

The controller synchronizes pulse and blink to MIDI Beat Clock. The module
sends that clock by default at a configurable BPM, so animated modes work with
no extra setup.

### Robust connection handling

- The module identifies the controller with a standard Identity Request and
  then performs Akai's Introduction handshake before sending anything else.
- After initialization, and after every reconnect, the complete saved LED
  state is resent so the hardware always reflects the project.
- A **Full Resync** command resends every LED on demand.
- If the controller is switched into Drum, Note, or Note Edit Mode, the
  module reports it, warns once, and restores the project's LED layout
  automatically when the controller returns to Session Mode.

### Interpreted logging

Optional input and output logs describe traffic in controller terms, for
example `Pad Pressed: 3.5`, `Fader Changed: Master Fader = 64 (50.4%)`, or
`Pad LED Updated: 1.1 = Palette 5 #FF0000, Pulse - 1/4 (requested #FA0505)`.
They are separate
from Chataigne's raw MIDI logging and never hide warnings.

## Requirements

- Chataigne 1.10.3 or newer. The module was developed and hardware-tested on
  1.10.3.
- An Akai APC Mini mkII connected over USB.

## Installation

### Community Modules Manager

Open `File > Community Modules Manager`, find **APC Mini mkII Enhanced**, and
press Install. The manager also notifies you when a new version is available.

### Manual

1. Download this repository as a zip.
2. Extract it into your Chataigne modules folder:
   `Documents/Chataigne/modules/`. The extracted folder must contain
   `module.json` directly, for example
   `Documents/Chataigne/modules/chataigne-apcmini2/module.json`.
3. Choose `File > Reload Custom Modules` or restart Chataigne.

## Getting started

1. Add the module with the **+** button in the Modules panel. It is listed
   under `Hardware > APC Mini mkII Enhanced`.
2. In the module's inspector, set **both** MIDI input and MIDI output to
   `APC mini mk2 Control`. Do not use the `APC mini mk2 Notes` port. Both
   directions are required even if you only plan to use one of them; the
   handshake, fader discovery, and mode detection all need the round trip.
3. Watch the Logger. Within a second you should see the module initialize. If
   a warning mentions the Notes port or a missing device, check step 2.
4. Light a pad: open `Parameters > Pads > Row 1 > Pad 1.1`, pick a color, and
   turn on **LED Enabled**. The pad lights immediately.
5. Read an input: press the same pad on the controller and watch
   `Values > Pads > Row 1 > Pad 1.1 > Is Pressed`. Map it like any other
   Chataigne value.

Pad coordinates are `row.column`. Row 1 is the top row and column 1 is the
leftmost column, so `Pad 8.1` is the bottom-left pad.

## Reference

### Parameters

`General`

| Parameter | Description |
| --- | --- |
| Blackout | Forces all 64 pad LEDs and 16 button LEDs off. Individual settings stay editable and are restored when Blackout is turned off. |
| Pad Brightness | `Full` (100%) or `Dim` (40%). Applies to pads only, not Track/Scene LEDs. |

`Clock`

| Parameter | Description |
| --- | --- |
| Send Clock | Sends MIDI Beat Clock to the controller. Enabled by default. Turn it off if another source is clocking the APC. |
| BPM | Tempo of the generated clock, 20 to 300. Pulse and blink subdivisions follow it. |

`Logging`

| Parameter | Description |
| --- | --- |
| Log Interpreted Input | Logs pads, buttons, faders, mode changes, and handshake replies in plain language. |
| Log Interpreted Output | Logs LED updates, resyncs, handshake requests, and clock configuration. |

`Pads > Row 1 … Row 8 > Pad r.c`

| Parameter | Description |
| --- | --- |
| LED Enabled | Turns the pad's LED on or off without discarding its color and mode. |
| Color Mode | `Exact RGB` or `Hardware Palette`. |
| Color | The desired color. Alpha scales brightness. |
| Palette Mode | Solid brightness, pulse rate, or blink rate. Only applies in Hardware Palette mode. |

`Buttons > Track Buttons > Track 1 … 8` and `Buttons > Scene Buttons > Scene 1 … 8`

| Parameter | Description |
| --- | --- |
| LED Mode | `Off`, `On`, or `Blink`. Track LEDs are red and Scene LEDs are green. |

### Values

| Value | Description |
| --- | --- |
| `Status > Pad Mode` | `Unknown`, `Session`, `Note`, `Drum`, or `Note Edit`. |
| `Pads > Row r > Pad r.c > Is Pressed` | True while the pad is held. |
| `Buttons > Track Buttons > Track n > Is Pressed` | True while the bottom-row button is held. |
| `Buttons > Scene Buttons > Scene n > Is Pressed` | True while the right-column button is held. |
| `Buttons > Shift > Is Pressed` | True while Shift is held. Shift has no LED. |
| `Faders > Fader 1 … 8 > Position` | Channel fader position, `0–1`. |
| `Faders > Master Fader > Position` | Master fader position, `0–1`. |

`Is Pressed` always reflects the raw physical state, including while Shift is
held. Combine it with `Shift > Is Pressed` in your own logic for shifted
actions.

### Commands

| Command | Description |
| --- | --- |
| Full Resync | Resends all 64 pad LEDs and all 16 button LEDs from the saved parameters. Ignored with a warning while disconnected or while initialization is pending. |

Commands appear in command and consequence choosers, not in the module
inspector.

## How it works

### Colors and brightness

The module multiplies the color's RGB by its alpha and by the Pad Brightness
multiplier, then rounds once to 8-bit values.

- In **Exact RGB** mode, that color is sent as is.
- In **Hardware Palette** mode, the nearest of the 128 native colors is chosen
  by RGB distance, then sent together with the selected Palette Mode. Dimming
  in palette mode can therefore step between palette entries or shift hue
  slightly, and very dark colors may snap to black.

A disabled or blacked-out pad is always sent as explicit black, so a saved
pulse or blink mode can never leave it flashing.

Changes are sent immediately once the controller is initialized. A full resync
packs every Exact RGB pad into a single SysEx message and sends palette and
disabled pads as individual notes.

### Connection lifecycle

1. When either MIDI device or the connection state changes, the module waits
   100 ms for Chataigne to finish rebuilding its MIDI connections.
2. It validates that both devices are selected and neither is the Notes port.
3. It sends an Identity Request. A non-APC reply blocks initialization; no
   reply within 500 ms falls through to the next step.
4. It sends Akai's Introduction message, which returns all nine fader
   positions. The request is retried once if there is no reply or if the
   controller returns the ambiguous all-maximum snapshot it sometimes sends
   right after reconnecting.
5. Initialization completes, the full LED state is sent, and MIDI Clock starts
   if enabled.

If the Introduction times out, the module still enables LED output and keeps
processing input; only the initial fader positions remain unknown until a fader
is moved. Warnings in the Logger explain which step failed.

### Pad modes

The APC Mini mkII has four hardware pad modes. Only **Session Mode**, the
default 8x8 layout, is supported.

- **Drum Mode** (Shift + Scene 6) sends notes on MIDI channel 10.
- **Note Mode** (Shift + Scene 7) plays notes through the separate
  `APC mini mk2 Notes` port.
- **Note Edit Mode** (hold Shift + Scene 7 while in Note Mode) edits Note Mode
  settings.

The controller reports mode changes and the module tracks them in
`Values > Status > Pad Mode`. Input from other modes is logged but never
mapped to pad values. Returning to Session Mode with the same shortcut triggers
an automatic full resync so the project's LED layout replaces the hardware
mode's layout.

### Scripting addresses

Every control has a stable short name for use in scripts and mappings. For
example:

```text
local.parameters.pads.row1.pad11.color
local.parameters.pads.row1.pad11.ledEnabled
local.parameters.pads.row1.pad11.colorMode        // "rgb" or "palette"
local.parameters.pads.row1.pad11.paletteMode      // e.g. "solid100", "pulse4", "blink8"
local.parameters.buttons.trackButtons.track1.ledMode  // "off", "on", "blink"
local.parameters.general.blackout
local.values.pads.row1.pad11.isPressed
local.values.faders.masterFader.position
local.values.status.padMode                       // "unknown", "session", "note", "drum", "note_edit"
```

## Troubleshooting

**A warning says the Notes port is not supported.** Select
`APC mini mk2 Control` for both MIDI input and output. On some platforms
Chataigne only exposes opaque device IDs, so the module cannot always tell the
ports apart by name. If identity succeeds but Introduction times out, the Notes
port or mismatched ports are the most likely cause.

**Faders show 0 until I move them.** The controller did not answer the
Introduction handshake, or answered with an ambiguous snapshot twice. Check the
device selection above. Moving a fader always updates its value.

**LEDs stopped matching the project.** Trigger the Full Resync command, or
toggle Blackout off and on. This also happens on every reconnect and every
return to Session Mode automatically.

**Pulse and blink modes do not animate.** The controller needs MIDI Clock.
Make sure `Clock > Send Clock` is on, or that another source is clocking the
APC.

**New parameters or commands are missing after updating the module.** Chataigne
builds a module's controls when the module is created. After updating, choose
`File > Reload Custom Modules` and then remove and re-add the module, or
restart Chataigne and reopen the project.

**Chataigne crashes when I remove the module.** Chataigne 1.10.3 can crash when
a MIDI module is deleted while its native MIDI Clock sender is running. Turn
off `Clock > Send Clock` before deleting the module. This affects any MIDI
module that is sending clock, not only this one.

**Pad Mode shows Unknown.** The controller has not reported its mode yet and
no pad has been pressed. It resolves on the first mode notification or Session
pad press.

## Development

`module.json` and `runtime/apc-mini-mkii.js` are generated. Edit the sources
instead:

- `scripts/lib/` defines the module hierarchy and generates `module.json`.
- `src/` is the TypeScript runtime compiled into the Chataigne script.

```sh
npm install
npm run build   # regenerate module.json and the runtime
npm test        # type-check, build, and run the unit tests
```

The runtime targets Chataigne's embedded JavaScript engine, which is stricter
and older than Node. The test suite checks the emitted script for known
incompatibilities.

## References

- Akai [APC mini mk2 User Guide v1.7](https://cdn.inmusicbrands.com/akai/apc-mini-mkii/APC%20mini%20mk2%20-%20User%20Guide%20-%20v1.7.pdf)
- Akai [APC mini mk2 Communication Protocol v1.0](https://cdn.inmusicbrands.com/akai/attachments/APC%20mini%20mk2%20-%20Communication%20Protocol%20-%20v1.0.pdf)

## License

Apache License 2.0. See [LICENSE](LICENSE).
