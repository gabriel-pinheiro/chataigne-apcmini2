# APC Mini mkII Enhanced

A Chataigne module for the Akai APC Mini mkII.

## Implemented input

The module exposes live, read-only values for:

- All 64 Session Mode pads, grouped into eight rows.
- Eight Track buttons, eight Scene buttons, and Shift.
- Eight channel faders and the Master Fader, normalized to `0–1`.

When the MIDI input disconnects or changes, held pad and button values reset to
false. Faders retain their last value. On connection, the module requests all
nine current fader positions from the controller. Some controller states return
`127` for all nine faders regardless of their physical positions; the module
retries once and preserves its last known values if that ambiguous response is
repeated.

### Interpreted logging

`Parameters > Logging` contains opt-in `Log Interpreted Input` and
`Log Interpreted Output` controls. These produce concise controller-aware
messages for pads, buttons, faders, modes, initialization, and MIDI Clock
configuration. They are independent from Chataigne's raw MIDI logging toggles.
Operational warnings remain enabled regardless of these settings.

## Implemented output

All 64 pad LEDs support Exact RGB and Hardware Palette output. Changes are sent
immediately after the controller has initialized. A color's alpha is multiplied
into its red, green, and blue components before output; Hardware Palette then
selects the nearest of the controller's 128 native colors.

The module sends the complete current pad state after initialization, including
after the initialization timeout. Disabled pads are explicitly sent as black,
so reconnecting cannot leave stale LEDs on the controller. The `Full Resync`
command can resend all 64 pads at any time after initialization; invoking it
while disconnected or while initialization is pending produces a warning and
is otherwise ignored.

Chataigne exposes `Full Resync` in command and consequence choosers, not in the
module inspector. After updating this module's `module.json`, use
`File > Reload Custom Modules` and recreate the module instance, or restart
Chataigne, so it rebuilds the cached command definition.

Hardware behavior and MIDI mappings are based on Akai's
[user guide](https://cdn.inmusicbrands.com/akai/apc-mini-mkii/APC%20mini%20mk2%20-%20User%20Guide%20-%20v1.7.pdf)
and [communication protocol](https://cdn.inmusicbrands.com/akai/attachments/APC%20mini%20mk2%20-%20Communication%20Protocol%20-%20v1.0.pdf).

## Pad modes

The APC Mini mkII has three hardware pad modes:

- **Session Mode** is the default 8x8 control-surface layout. This is the only
  pad mode supported by this module.
- **Drum Mode** is toggled with Shift + Scene 6. It sends a different range of
  musical notes on MIDI channel 10 and is not currently supported.
- **Note Mode** is toggled with Shift + Scene 7. It sends musical notes through
  the separate `APC mini mk2 Notes` MIDI port and is not currently supported.

Select `APC mini mk2 Control` for both the module's MIDI input and output. If
you enter Drum or Note Mode accidentally, press the same Shift combination
again to return to Session Mode.

The detected mode is available at `Values > Status > Pad Mode`. Until the
controller reports its mode or sends an identifiable pad event, it is shown as
`Unknown`.
