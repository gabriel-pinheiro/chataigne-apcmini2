var interpretedInputLogControl: ChataigneParameter<boolean>;
var interpretedOutputLogControl: ChataigneParameter<boolean>;
var sendClockControl: ChataigneParameter<boolean>;
var bpmControl: ChataigneParameter<number>;
var lastLoggedFaderValues = [-1, -1, -1, -1, -1, -1, -1, -1, -1];

function initializeLogging(): void {
  interpretedInputLogControl = local.parameters.logging.logInterpretedInput;
  interpretedOutputLogControl = local.parameters.logging.logInterpretedOutput;
  sendClockControl = local.parameters.clock.sendClock;
  bpmControl = local.parameters.clock.bpm;
}

function logPadInput(note: number, isPressed: boolean): void {
  if (!interpretedInputLogControl.get()) return;
  script.log("Pad " + (isPressed ? "Pressed: " : "Released: ") + padLabel(note));
}

function logButtonInput(note: number, isPressed: boolean): void {
  if (!interpretedInputLogControl.get()) return;
  var label = buttonLabel(note);
  if (label == "Shift") {
    script.log("Shift " + (isPressed ? "Pressed" : "Released"));
    return;
  }
  script.log("Button " + (isPressed ? "Pressed: " : "Released: ") + label);
}

function logFaderInput(index: number, value: number): void {
  if (!interpretedInputLogControl.get()) return;
  if (lastLoggedFaderValues[index] == value) return;
  lastLoggedFaderValues[index] = value;
  script.log("Fader Changed: " + faderLabel(index) + " = " + formatMidiValue(value));
}

function logDrumPadInput(pitch: number, isPressed: boolean): void {
  if (!interpretedInputLogControl.get()) return;
  script.log(
    "Unsupported Drum Pad " + (isPressed ? "Pressed" : "Released") + ": note " + pitch
  );
}

function logPadModeInput(mode: PadMode): void {
  if (!interpretedInputLogControl.get()) return;
  script.log("Pad Mode Changed: " + padModeLabel(mode));
}

function logUnrecognizedNoteInput(
  eventName: string,
  channel: number,
  pitch: number,
  velocity: number
): void {
  if (!interpretedInputLogControl.get()) return;
  script.log(
    "Unrecognized Input: " + eventName + ", channel " + channel
    + ", note " + pitch + ", velocity " + velocity
  );
}

function logUnrecognizedCcInput(channel: number, number: number, value: number): void {
  if (!interpretedInputLogControl.get()) return;
  script.log(
    "Unrecognized Input: Control Change, channel " + channel
    + ", CC " + number + ", value " + value
  );
}

function logUnrecognizedSysexInput(data: number[]): void {
  if (!interpretedInputLogControl.get()) return;
  var messageId = data.length > 3 ? data[3] : -1;
  script.log(
    "Unrecognized Input: SysEx, " + data.length + " bytes, message ID " + messageId
  );
}

function logInvalidIntroductionResponse(byteCount: number): void {
  if (!interpretedInputLogControl.get()) return;
  script.log("Introduction Response Invalid: " + byteCount + " payload bytes");
}

function logAmbiguousIntroductionResponse(willRetry: boolean): void {
  if (!interpretedInputLogControl.get()) return;
  if (willRetry) {
    script.log("Introduction Response: all faders returned 127; retrying");
  } else {
    script.log("Introduction Response: all faders returned 127; keeping last known values");
  }
}

function logSuccessfulIntroductionResponse(values: number[]): void {
  if (!interpretedInputLogControl.get()) return;
  var message = "Introduction Complete: ";
  for (var index = 0; index < values.length; index += 1) {
    if (index > 0) message += ", ";
    message += faderLabel(index) + " = " + formatMidiValue(values[index]);
  }
  script.log(message);
}

function logIdentityRequest(): void {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Identity Request Sent");
}

function logIdentityReply(data: number[], isApc: boolean): void {
  if (!interpretedInputLogControl.get()) return;
  if (!isApc) {
    script.log(
      "Identity Reply: manufacturer " + (data.length >= 5 ? data[4] : "unknown")
      + ", product " + (data.length >= 6 ? data[5] : "unknown")
    );
    return;
  }

  var revision = data.length >= 12 ? formatByteRange(data, 8, 4) : "unavailable";
  var deviceId = data.length >= 13 ? "" + data[12] : "unavailable";
  script.log(
    "Identity Reply: APC Mini mkII, software revision bytes [" + revision
    + "], device ID " + deviceId
  );
}

function logIntroductionRequest(attempt: number): void {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Introduction Request Sent: attempt " + attempt);
}

function logPadLedOutput(note: number, rgb: number[]): void {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Pad LED Updated: " + padLabel(note) + " = " + formatRgbHex(rgb));
}

function logPalettePadLedOutput(
  note: number,
  paletteIndex: number,
  selectedRgb: number[],
  requestedRgb: number[],
  paletteModeLabel: string
): void {
  if (!interpretedOutputLogControl.get()) return;
  script.log(
    "Pad LED Updated: " + padLabel(note)
    + " = Palette " + paletteIndex + " " + formatRgbHex(selectedRgb)
    + ", " + paletteModeLabel
    + " (requested " + formatRgbHex(requestedRgb) + ")"
  );
}

function logPadLedOff(note: number): void {
  if (!interpretedOutputLogControl.get()) return;
  if (isBlackoutActive()) {
    script.log("Pad LED Blacked Out: " + padLabel(note));
    return;
  }
  script.log("Pad LED Disabled: " + padLabel(note));
}

function logGeneralLedOutputChange(parameter: ChataigneParameter<unknown>): void {
  if (!interpretedOutputLogControl.get()) return;
  if (parameter.is(local.parameters.general.blackout)) {
    script.log("Blackout " + (isBlackoutActive() ? "Enabled" : "Disabled"));
  } else {
    script.log(
      "Pad Brightness Changed: "
      + (local.parameters.general.padBrightness.get() == "dim" ? "Dim" : "Full")
      + " (" + Math.round(padBrightnessMultiplier() * 100) + "%)"
    );
  }
}

function logButtonLedOutput(note: number, modeLabel: string): void {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Button LED Updated: " + buttonLabel(note) + " = " + modeLabel);
}

function logFullControllerResyncOutput(): void {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Full Resync Sent: 64 pad LEDs, 16 button LEDs");
}

function handleLoggingParameterChange(parameter: ChataigneParameter<unknown>): void {
  if (parameter.is(interpretedInputLogControl)) {
    if (interpretedInputLogControl.get()) resetFaderLogHistory();
    return;
  }

  if (parameter.is(interpretedOutputLogControl)) {
    if (interpretedOutputLogControl.get()) logCurrentClockState();
    return;
  }

  if (!interpretedOutputLogControl.get()) return;
  if (parameter.is(sendClockControl)) {
    logCurrentClockState();
  } else if (parameter.is(bpmControl)) {
    script.log("MIDI Clock BPM Changed: " + bpmControl.get());
  }
}

function resetFaderLogHistory(): void {
  for (var index = 0; index < lastLoggedFaderValues.length; index += 1) {
    lastLoggedFaderValues[index] = -1;
  }
}

function logCurrentClockState(): void {
  if (!interpretedOutputLogControl.get()) return;
  if (sendClockControl.get()) {
    script.log("MIDI Clock Enabled: " + bpmControl.get() + " BPM");
  } else {
    script.log("MIDI Clock Disabled");
  }
}

function padLabel(note: number): string {
  // JUCE's Math.floor returns a double, which stringifies as e.g. "4.0".
  // Math.round converts the result back to an integer var before formatting.
  var row = Math.round(8 - Math.floor(note / 8));
  var column = note % 8 + 1;
  return row + "." + column;
}

function buttonLabel(note: number): string {
  if (note >= trackButtonNoteMinimum && note <= trackButtonNoteMaximum) {
    return "Track " + (note - trackButtonNoteMinimum + 1);
  }
  if (note >= sceneButtonNoteMinimum && note <= sceneButtonNoteMaximum) {
    return "Scene " + (note - sceneButtonNoteMinimum + 1);
  }
  if (note == shiftButtonNote) return "Shift";
  return "Unknown";
}

function faderLabel(index: number): string {
  if (index == 8) return "Master Fader";
  return "Fader " + (index + 1);
}

function padModeLabel(mode: PadMode): string {
  if (mode == "session") return "Session";
  if (mode == "note") return "Note";
  if (mode == "drum") return "Drum";
  if (mode == "note_edit") return "Note Edit";
  return "Unknown";
}

function formatMidiValue(value: number): string {
  // Build the decimal from integer tenths. Stringifying JUCE doubles directly
  // can expose floating-point noise such as 31.500000000000004.
  var percentageTenths = Math.round(value * 1000 / 127);
  var percentageWhole = Math.round(Math.floor(percentageTenths / 10));
  var percentageFraction = percentageTenths % 10;
  var percentage = "" + percentageWhole;
  if (percentageFraction != 0) percentage += "." + percentageFraction;
  return value + " (" + percentage + "%)";
}

function formatHexByte(value: number): string {
  var digits = "0123456789ABCDEF";
  return digits.charAt(Math.floor(value / 16)) + digits.charAt(value % 16);
}

function formatRgbHex(rgb: number[]): string {
  return "#" + formatHexByte(rgb[0]) + formatHexByte(rgb[1]) + formatHexByte(rgb[2]);
}

function formatByteRange(values: number[], start: number, count: number): string {
  var result = "";
  var end = Math.min(values.length, start + count);
  for (var index = start; index < end; index += 1) {
    if (result != "") result += ", ";
    result += values[index];
  }
  return result;
}
