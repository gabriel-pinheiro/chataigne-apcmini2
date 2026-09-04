# APC Mini mkII Enhanced

A Chataigne module for the Akai APC Mini mkII.

## Implemented input

The module exposes live, read-only values for:

- All 64 Session Mode pads, grouped into eight rows.
- Eight Track buttons, eight Scene buttons, and Shift.
- Eight channel faders and the Master Fader, normalized to `0–1`.

When the MIDI input disconnects or changes, held pad and button values reset to
false. Faders retain their last value. On connection, the module requests all
nine current fader positions from the controller.

Select `APC mini mk2 Control` for both MIDI input and output, even if you only
intend to use input or output. Both directions are required for identity,
initial fader discovery, pad-mode detection, and reliable reconnect behavior.
Do not use the `APC mini mk2 Notes` port.

### Interpreted logging

`Parameters > Logging` contains opt-in `Log Interpreted Input` and
`Log Interpreted Output` controls. These produce concise controller-aware
messages for pads, buttons, faders, modes, Identity and Introduction handshake
traffic, and MIDI Clock configuration. They are independent from Chataigne's
raw MIDI logging toggles. Operational warnings remain enabled regardless of
these settings.

## Implemented output

All 64 pad LEDs support Exact RGB and Hardware Palette output. Changes are sent
immediately after the controller has initialized. A color's alpha is multiplied
into its red, green, and blue components before output; Hardware Palette then
selects the nearest of the controller's 128 native colors.

Hardware Palette supports all native LED behaviors: seven solid brightness
levels, four pulse rates, and five blink rates. Pulse and blink subdivisions
follow MIDI Beat Clock; the module's `Clock > Send Clock` control is enabled by
default so animated modes work without additional configuration.

### Chataigne 1.10.3 removal issue

Chataigne 1.10.3 can crash when a MIDI module is removed while its native MIDI
Clock sender is running. Before deleting this module, turn off
`Parameters > Clock > Send Clock`. The crash is in Chataigne's MIDI module
teardown rather than this module's script; it can affect any MIDI module that
is actively sending Clock.

All eight Track LEDs and eight Scene LEDs support their native Off, On, and
Blink modes. Shift is input-only because the controller has no Shift LED.

The module sends the complete current LED state after initialization, including
after the initialization timeout. Disabled pads and Off buttons are explicitly
sent off, so reconnecting cannot leave stale LEDs on the controller. The
`Full Resync` command can resend all 64 pads and all 16 Track/Scene button LEDs
at any time after initialization; invoking it while disconnected or while
initialization is pending produces a warning and is otherwise ignored.

Chataigne exposes `Full Resync` in command and consequence choosers, not in the
module inspector. After updating this module's `module.json`, use
`File > Reload Custom Modules` and recreate the module instance, or restart
Chataigne, so it rebuilds the cached command definition.

Hardware behavior and MIDI mappings are based on Akai's
[user guide](https://cdn.inmusicbrands.com/akai/apc-mini-mkii/APC%20mini%20mk2%20-%20User%20Guide%20-%20v1.7.pdf)
and [communication protocol](https://cdn.inmusicbrands.com/akai/attachments/APC%20mini%20mk2%20-%20Communication%20Protocol%20-%20v1.0.pdf).

## Pad modes

The APC Mini mkII has four hardware pad modes:

- **Session Mode** is the default 8x8 control-surface layout. This is the only
  pad mode supported by this module.
- **Drum Mode** is toggled with Shift + Scene 6. It sends a different range of
  musical notes on MIDI channel 10 and is not currently supported.
- **Note Mode** is toggled with Shift + Scene 7. It sends musical notes through
  the separate `APC mini mk2 Notes` MIDI port and is not currently supported.
- **Note Edit Mode** is entered by holding Shift and Scene 7 while in Note Mode.
  It is used to edit Note Mode settings and is not currently supported.

If you enter Drum, Note, or Note Edit Mode accidentally, use the controller's
mode shortcut to return to Session Mode. When the module detects a transition
back to Session Mode, it automatically performs a full resync of all pad and
button LEDs so the saved Chataigne state replaces the hardware mode's LED
layout.

The detected mode is available at `Values > Status > Pad Mode`. Until the
controller reports its mode or sends an identifiable pad event, it is shown as
`Unknown`.
