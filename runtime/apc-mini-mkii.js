var sessionMidiChannel = 1;
var drumMidiChannel = 10;
var sessionPadNoteMinimum = 0;
var sessionPadNoteMaximum = 63;
var drumPadNoteMinimum = 64;
var drumPadNoteMaximum = 127;
var trackButtonNoteMinimum = 100;
var trackButtonNoteMaximum = 107;
var sceneButtonNoteMinimum = 112;
var sceneButtonNoteMaximum = 119;
var shiftButtonNote = 122;
var faderCcMinimum = 48;
var faderCcMaximum = 56;
var akaiManufacturerId = 71;
var apcProductId = 79;
var introductionRequestId = 96;
var introductionResponseId = 97;
var padModeMessageId = 98;
function isApcSysex(data, messageId) {
  return data.length >= 4 && data[0] == akaiManufacturerId && data[1] == 127 && data[2] == apcProductId && data[3] == messageId;
}
function decodePadMode(data) {
  if (!isApcSysex(data, padModeMessageId) || data.length < 7) return "";
  var mode = data[6];
  if (mode == 0) return "session";
  if (mode == 1) return "note";
  if (mode == 2) return "drum";
  return "";
}
function decodeIntroductionFaders(data) {
  if (!isApcSysex(data, introductionResponseId) || data.length < 15) return [];
  var values = [];
  for (var index = 0; index < 9; index += 1) {
    var value = data[index + 6];
    if (value < 0 || value > 127) return [];
    values.push(value);
  }
  return values;
}
function sendIntroductionRequest() {
  local.sendSysex(
    akaiManufacturerId,
    127,
    apcProductId,
    introductionRequestId,
    0,
    4,
    0,
    0,
    1,
    0
  );
}
function normalizeMidiValue(value) {
  return Math.max(0, Math.min(127, value)) / 127;
}
function setSessionPadPressed(note, isPressed) {
  if (note >= 56 && note <= 63) {
    if (note == 56) local.values.pads.row1.pad11.isPressed.set(isPressed);
    if (note == 57) local.values.pads.row1.pad12.isPressed.set(isPressed);
    if (note == 58) local.values.pads.row1.pad13.isPressed.set(isPressed);
    if (note == 59) local.values.pads.row1.pad14.isPressed.set(isPressed);
    if (note == 60) local.values.pads.row1.pad15.isPressed.set(isPressed);
    if (note == 61) local.values.pads.row1.pad16.isPressed.set(isPressed);
    if (note == 62) local.values.pads.row1.pad17.isPressed.set(isPressed);
    if (note == 63) local.values.pads.row1.pad18.isPressed.set(isPressed);
    return;
  }
  if (note >= 48 && note <= 55) {
    if (note == 48) local.values.pads.row2.pad21.isPressed.set(isPressed);
    if (note == 49) local.values.pads.row2.pad22.isPressed.set(isPressed);
    if (note == 50) local.values.pads.row2.pad23.isPressed.set(isPressed);
    if (note == 51) local.values.pads.row2.pad24.isPressed.set(isPressed);
    if (note == 52) local.values.pads.row2.pad25.isPressed.set(isPressed);
    if (note == 53) local.values.pads.row2.pad26.isPressed.set(isPressed);
    if (note == 54) local.values.pads.row2.pad27.isPressed.set(isPressed);
    if (note == 55) local.values.pads.row2.pad28.isPressed.set(isPressed);
    return;
  }
  if (note >= 40 && note <= 47) {
    if (note == 40) local.values.pads.row3.pad31.isPressed.set(isPressed);
    if (note == 41) local.values.pads.row3.pad32.isPressed.set(isPressed);
    if (note == 42) local.values.pads.row3.pad33.isPressed.set(isPressed);
    if (note == 43) local.values.pads.row3.pad34.isPressed.set(isPressed);
    if (note == 44) local.values.pads.row3.pad35.isPressed.set(isPressed);
    if (note == 45) local.values.pads.row3.pad36.isPressed.set(isPressed);
    if (note == 46) local.values.pads.row3.pad37.isPressed.set(isPressed);
    if (note == 47) local.values.pads.row3.pad38.isPressed.set(isPressed);
    return;
  }
  if (note >= 32 && note <= 39) {
    if (note == 32) local.values.pads.row4.pad41.isPressed.set(isPressed);
    if (note == 33) local.values.pads.row4.pad42.isPressed.set(isPressed);
    if (note == 34) local.values.pads.row4.pad43.isPressed.set(isPressed);
    if (note == 35) local.values.pads.row4.pad44.isPressed.set(isPressed);
    if (note == 36) local.values.pads.row4.pad45.isPressed.set(isPressed);
    if (note == 37) local.values.pads.row4.pad46.isPressed.set(isPressed);
    if (note == 38) local.values.pads.row4.pad47.isPressed.set(isPressed);
    if (note == 39) local.values.pads.row4.pad48.isPressed.set(isPressed);
    return;
  }
  if (note >= 24 && note <= 31) {
    if (note == 24) local.values.pads.row5.pad51.isPressed.set(isPressed);
    if (note == 25) local.values.pads.row5.pad52.isPressed.set(isPressed);
    if (note == 26) local.values.pads.row5.pad53.isPressed.set(isPressed);
    if (note == 27) local.values.pads.row5.pad54.isPressed.set(isPressed);
    if (note == 28) local.values.pads.row5.pad55.isPressed.set(isPressed);
    if (note == 29) local.values.pads.row5.pad56.isPressed.set(isPressed);
    if (note == 30) local.values.pads.row5.pad57.isPressed.set(isPressed);
    if (note == 31) local.values.pads.row5.pad58.isPressed.set(isPressed);
    return;
  }
  if (note >= 16 && note <= 23) {
    if (note == 16) local.values.pads.row6.pad61.isPressed.set(isPressed);
    if (note == 17) local.values.pads.row6.pad62.isPressed.set(isPressed);
    if (note == 18) local.values.pads.row6.pad63.isPressed.set(isPressed);
    if (note == 19) local.values.pads.row6.pad64.isPressed.set(isPressed);
    if (note == 20) local.values.pads.row6.pad65.isPressed.set(isPressed);
    if (note == 21) local.values.pads.row6.pad66.isPressed.set(isPressed);
    if (note == 22) local.values.pads.row6.pad67.isPressed.set(isPressed);
    if (note == 23) local.values.pads.row6.pad68.isPressed.set(isPressed);
    return;
  }
  if (note >= 8 && note <= 15) {
    if (note == 8) local.values.pads.row7.pad71.isPressed.set(isPressed);
    if (note == 9) local.values.pads.row7.pad72.isPressed.set(isPressed);
    if (note == 10) local.values.pads.row7.pad73.isPressed.set(isPressed);
    if (note == 11) local.values.pads.row7.pad74.isPressed.set(isPressed);
    if (note == 12) local.values.pads.row7.pad75.isPressed.set(isPressed);
    if (note == 13) local.values.pads.row7.pad76.isPressed.set(isPressed);
    if (note == 14) local.values.pads.row7.pad77.isPressed.set(isPressed);
    if (note == 15) local.values.pads.row7.pad78.isPressed.set(isPressed);
    return;
  }
  if (note >= 0 && note <= 7) {
    if (note == 0) local.values.pads.row8.pad81.isPressed.set(isPressed);
    if (note == 1) local.values.pads.row8.pad82.isPressed.set(isPressed);
    if (note == 2) local.values.pads.row8.pad83.isPressed.set(isPressed);
    if (note == 3) local.values.pads.row8.pad84.isPressed.set(isPressed);
    if (note == 4) local.values.pads.row8.pad85.isPressed.set(isPressed);
    if (note == 5) local.values.pads.row8.pad86.isPressed.set(isPressed);
    if (note == 6) local.values.pads.row8.pad87.isPressed.set(isPressed);
    if (note == 7) local.values.pads.row8.pad88.isPressed.set(isPressed);
    return;
  }
}
function setButtonPressed(note, isPressed) {
  if (note == 100) {
    local.values.buttons.trackButtons.track1.isPressed.set(isPressed);
    return true;
  }
  if (note == 101) {
    local.values.buttons.trackButtons.track2.isPressed.set(isPressed);
    return true;
  }
  if (note == 102) {
    local.values.buttons.trackButtons.track3.isPressed.set(isPressed);
    return true;
  }
  if (note == 103) {
    local.values.buttons.trackButtons.track4.isPressed.set(isPressed);
    return true;
  }
  if (note == 104) {
    local.values.buttons.trackButtons.track5.isPressed.set(isPressed);
    return true;
  }
  if (note == 105) {
    local.values.buttons.trackButtons.track6.isPressed.set(isPressed);
    return true;
  }
  if (note == 106) {
    local.values.buttons.trackButtons.track7.isPressed.set(isPressed);
    return true;
  }
  if (note == 107) {
    local.values.buttons.trackButtons.track8.isPressed.set(isPressed);
    return true;
  }
  if (note == 112) {
    local.values.buttons.sceneButtons.scene1.isPressed.set(isPressed);
    return true;
  }
  if (note == 113) {
    local.values.buttons.sceneButtons.scene2.isPressed.set(isPressed);
    return true;
  }
  if (note == 114) {
    local.values.buttons.sceneButtons.scene3.isPressed.set(isPressed);
    return true;
  }
  if (note == 115) {
    local.values.buttons.sceneButtons.scene4.isPressed.set(isPressed);
    return true;
  }
  if (note == 116) {
    local.values.buttons.sceneButtons.scene5.isPressed.set(isPressed);
    return true;
  }
  if (note == 117) {
    local.values.buttons.sceneButtons.scene6.isPressed.set(isPressed);
    return true;
  }
  if (note == 118) {
    local.values.buttons.sceneButtons.scene7.isPressed.set(isPressed);
    return true;
  }
  if (note == 119) {
    local.values.buttons.sceneButtons.scene8.isPressed.set(isPressed);
    return true;
  }
  if (note == shiftButtonNote) {
    local.values.buttons.shift.isPressed.set(isPressed);
    return true;
  }
  return false;
}
function setFaderPosition(index, midiValue) {
  var position = normalizeMidiValue(midiValue);
  if (index == 0) {
    local.values.faders.fader1.position.set(position);
    return;
  }
  if (index == 1) {
    local.values.faders.fader2.position.set(position);
    return;
  }
  if (index == 2) {
    local.values.faders.fader3.position.set(position);
    return;
  }
  if (index == 3) {
    local.values.faders.fader4.position.set(position);
    return;
  }
  if (index == 4) {
    local.values.faders.fader5.position.set(position);
    return;
  }
  if (index == 5) {
    local.values.faders.fader6.position.set(position);
    return;
  }
  if (index == 6) {
    local.values.faders.fader7.position.set(position);
    return;
  }
  if (index == 7) {
    local.values.faders.fader8.position.set(position);
    return;
  }
  if (index == 8) local.values.faders.masterFader.position.set(position);
}
function resetPressedValues() {
  var note;
  for (note = sessionPadNoteMinimum; note <= sessionPadNoteMaximum; note += 1) {
    setSessionPadPressed(note, false);
  }
  for (note = trackButtonNoteMinimum; note <= trackButtonNoteMaximum; note += 1) {
    setButtonPressed(note, false);
  }
  for (note = sceneButtonNoteMinimum; note <= sceneButtonNoteMaximum; note += 1) {
    setButtonPressed(note, false);
  }
  setButtonPressed(shiftButtonNote, false);
}
var interpretedInputLogControl;
var interpretedOutputLogControl;
var sendClockControl;
var bpmControl;
var lastLoggedFaderValues = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
function initializeLogging() {
  interpretedInputLogControl = local.parameters.logging.logInterpretedInput;
  interpretedOutputLogControl = local.parameters.logging.logInterpretedOutput;
  sendClockControl = local.parameters.clock.sendClock;
  bpmControl = local.parameters.clock.bpm;
}
function logPadInput(note, isPressed) {
  if (!interpretedInputLogControl.get()) return;
  script.log("Pad " + (isPressed ? "Pressed: " : "Released: ") + padLabel(note));
}
function logButtonInput(note, isPressed) {
  if (!interpretedInputLogControl.get()) return;
  var label = buttonLabel(note);
  if (label == "Shift") {
    script.log("Shift " + (isPressed ? "Pressed" : "Released"));
    return;
  }
  script.log("Button " + (isPressed ? "Pressed: " : "Released: ") + label);
}
function logFaderInput(index, value) {
  if (!interpretedInputLogControl.get()) return;
  if (lastLoggedFaderValues[index] == value) return;
  lastLoggedFaderValues[index] = value;
  script.log("Fader Changed: " + faderLabel(index) + " = " + formatMidiValue(value));
}
function logDrumPadInput(pitch, isPressed) {
  if (!interpretedInputLogControl.get()) return;
  script.log(
    "Unsupported Drum Pad " + (isPressed ? "Pressed" : "Released") + ": note " + pitch
  );
}
function logPadModeInput(mode) {
  if (!interpretedInputLogControl.get()) return;
  script.log("Pad Mode Changed: " + padModeLabel(mode));
}
function logUnrecognizedNoteInput(eventName, channel, pitch, velocity) {
  if (!interpretedInputLogControl.get()) return;
  script.log(
    "Unrecognized Input: " + eventName + ", channel " + channel + ", note " + pitch + ", velocity " + velocity
  );
}
function logUnrecognizedCcInput(channel, number, value) {
  if (!interpretedInputLogControl.get()) return;
  script.log(
    "Unrecognized Input: Control Change, channel " + channel + ", CC " + number + ", value " + value
  );
}
function logUnrecognizedSysexInput(data) {
  if (!interpretedInputLogControl.get()) return;
  var messageId = data.length > 3 ? data[3] : -1;
  script.log(
    "Unrecognized Input: SysEx, " + data.length + " bytes, message ID " + messageId
  );
}
function logInvalidIntroductionResponse(byteCount) {
  if (!interpretedInputLogControl.get()) return;
  script.log("Initialization Response Invalid: " + byteCount + " payload bytes");
}
function logAmbiguousIntroductionResponse(willRetry) {
  if (!interpretedInputLogControl.get()) return;
  if (willRetry) {
    script.log("Initialization Response: all faders returned 127; retrying");
  } else {
    script.log("Initialization Response: all faders returned 127; keeping last known values");
  }
}
function logSuccessfulIntroductionResponse(values) {
  if (!interpretedInputLogControl.get()) return;
  var message = "Initialization Complete: ";
  for (var index = 0; index < values.length; index += 1) {
    if (index > 0) message += ", ";
    message += faderLabel(index) + " = " + formatMidiValue(values[index]);
  }
  script.log(message);
}
function logInitializationRequest(attempt) {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Initialization Request Sent: attempt " + attempt);
}
function logPadLedOutput(note, rgb) {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Pad LED Updated: " + padLabel(note) + " = " + formatRgbHex(rgb));
}
function logPalettePadLedOutput(note, paletteIndex, selectedRgb, requestedRgb) {
  if (!interpretedOutputLogControl.get()) return;
  script.log(
    "Pad LED Updated: " + padLabel(note) + " = Palette " + paletteIndex + " " + formatRgbHex(selectedRgb) + " (requested " + formatRgbHex(requestedRgb) + ")"
  );
}
function logPadLedDisabled(note) {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Pad LED Disabled: " + padLabel(note));
}
function logFullPadResyncOutput() {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Full Resync Sent: 64 pad LEDs");
}
function handleLoggingParameterChange(parameter) {
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
function resetFaderLogHistory() {
  for (var index = 0; index < lastLoggedFaderValues.length; index += 1) {
    lastLoggedFaderValues[index] = -1;
  }
}
function logCurrentClockState() {
  if (!interpretedOutputLogControl.get()) return;
  if (sendClockControl.get()) {
    script.log("MIDI Clock Enabled: " + bpmControl.get() + " BPM");
  } else {
    script.log("MIDI Clock Disabled");
  }
}
function padLabel(note) {
  var row = Math.round(8 - Math.floor(note / 8));
  var column = note % 8 + 1;
  return row + "." + column;
}
function buttonLabel(note) {
  if (note >= trackButtonNoteMinimum && note <= trackButtonNoteMaximum) {
    return "Track " + (note - trackButtonNoteMinimum + 1);
  }
  if (note >= sceneButtonNoteMinimum && note <= sceneButtonNoteMaximum) {
    return "Scene " + (note - sceneButtonNoteMinimum + 1);
  }
  if (note == shiftButtonNote) return "Shift";
  return "Unknown";
}
function faderLabel(index) {
  if (index == 8) return "Master Fader";
  return "Fader " + (index + 1);
}
function padModeLabel(mode) {
  if (mode == "session") return "Session";
  if (mode == "note") return "Note";
  if (mode == "drum") return "Drum";
  return "Unknown";
}
function formatMidiValue(value) {
  var percentageTenths = Math.round(value * 1e3 / 127);
  var percentageWhole = Math.round(Math.floor(percentageTenths / 10));
  var percentageFraction = percentageTenths % 10;
  var percentage = "" + percentageWhole;
  if (percentageFraction != 0) percentage += "." + percentageFraction;
  return value + " (" + percentage + "%)";
}
function formatHexByte(value) {
  var digits = "0123456789ABCDEF";
  return digits.charAt(Math.floor(value / 16)) + digits.charAt(value % 16);
}
function formatRgbHex(rgb) {
  return "#" + formatHexByte(rgb[0]) + formatHexByte(rgb[1]) + formatHexByte(rgb[2]);
}
var hardwarePaletteColors = [
  0,
  1973790,
  8355711,
  16777215,
  16731212,
  16711680,
  5832704,
  1638400,
  16760172,
  16733184,
  5840128,
  2562816,
  16777036,
  16776960,
  5855488,
  1644800,
  8978252,
  5570304,
  1923328,
  1321728,
  5046092,
  65280,
  22784,
  6400,
  5046110,
  65305,
  22797,
  6402,
  5046152,
  65365,
  22813,
  7954,
  5046199,
  65433,
  22837,
  6418,
  5030911,
  43519,
  16722,
  4121,
  5015807,
  22015,
  7513,
  2073,
  5000447,
  255,
  89,
  25,
  8867071,
  5505279,
  1638500,
  983088,
  16731391,
  16711935,
  5832793,
  1638425,
  16731271,
  16711764,
  5832733,
  2228243,
  16717056,
  10040576,
  7950592,
  4416512,
  211200,
  22325,
  21631,
  255,
  17743,
  2425036,
  8355711,
  2105376,
  16711680,
  12451629,
  11529478,
  6618889,
  1084160,
  65415,
  43519,
  11007,
  4129023,
  7995647,
  11672189,
  4202752,
  16730624,
  8970502,
  7536405,
  65280,
  3931942,
  5898097,
  3735500,
  5999359,
  3232198,
  8880105,
  13835775,
  16711773,
  16744192,
  12169216,
  9502464,
  8609031,
  3746560,
  1330192,
  872504,
  1381674,
  1450074,
  6896668,
  11010058,
  14569789,
  14182940,
  16769318,
  10412335,
  6796559,
  1973808,
  14483307,
  8454077,
  10131967,
  9332479,
  4210752,
  7697781,
  14745599,
  10485760,
  3473408,
  1757184,
  475648,
  12169216,
  4141312,
  11755264,
  4920578
];
function nearestHardwarePaletteIndex(rgb) {
  var closestIndex = 0;
  var closestDistance = -1;
  for (var index = 0; index < hardwarePaletteColors.length; index += 1) {
    var paletteRgb = hardwarePaletteRgb(index);
    var redDifference = rgb[0] - paletteRgb[0];
    var greenDifference = rgb[1] - paletteRgb[1];
    var blueDifference = rgb[2] - paletteRgb[2];
    var distance = redDifference * redDifference + greenDifference * greenDifference + blueDifference * blueDifference;
    if (closestDistance < 0 || distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }
  return closestIndex;
}
function hardwarePaletteRgb(index) {
  var color = hardwarePaletteColors[index];
  return [
    Math.floor(color / 65536) % 256,
    Math.floor(color / 256) % 256,
    color % 256
  ];
}
function visitPadControls(operation) {
  handlePadControl(operation, 56, local.parameters.pads.row1.pad11);
  handlePadControl(operation, 57, local.parameters.pads.row1.pad12);
  handlePadControl(operation, 58, local.parameters.pads.row1.pad13);
  handlePadControl(operation, 59, local.parameters.pads.row1.pad14);
  handlePadControl(operation, 60, local.parameters.pads.row1.pad15);
  handlePadControl(operation, 61, local.parameters.pads.row1.pad16);
  handlePadControl(operation, 62, local.parameters.pads.row1.pad17);
  handlePadControl(operation, 63, local.parameters.pads.row1.pad18);
  handlePadControl(operation, 48, local.parameters.pads.row2.pad21);
  handlePadControl(operation, 49, local.parameters.pads.row2.pad22);
  handlePadControl(operation, 50, local.parameters.pads.row2.pad23);
  handlePadControl(operation, 51, local.parameters.pads.row2.pad24);
  handlePadControl(operation, 52, local.parameters.pads.row2.pad25);
  handlePadControl(operation, 53, local.parameters.pads.row2.pad26);
  handlePadControl(operation, 54, local.parameters.pads.row2.pad27);
  handlePadControl(operation, 55, local.parameters.pads.row2.pad28);
  handlePadControl(operation, 40, local.parameters.pads.row3.pad31);
  handlePadControl(operation, 41, local.parameters.pads.row3.pad32);
  handlePadControl(operation, 42, local.parameters.pads.row3.pad33);
  handlePadControl(operation, 43, local.parameters.pads.row3.pad34);
  handlePadControl(operation, 44, local.parameters.pads.row3.pad35);
  handlePadControl(operation, 45, local.parameters.pads.row3.pad36);
  handlePadControl(operation, 46, local.parameters.pads.row3.pad37);
  handlePadControl(operation, 47, local.parameters.pads.row3.pad38);
  handlePadControl(operation, 32, local.parameters.pads.row4.pad41);
  handlePadControl(operation, 33, local.parameters.pads.row4.pad42);
  handlePadControl(operation, 34, local.parameters.pads.row4.pad43);
  handlePadControl(operation, 35, local.parameters.pads.row4.pad44);
  handlePadControl(operation, 36, local.parameters.pads.row4.pad45);
  handlePadControl(operation, 37, local.parameters.pads.row4.pad46);
  handlePadControl(operation, 38, local.parameters.pads.row4.pad47);
  handlePadControl(operation, 39, local.parameters.pads.row4.pad48);
  handlePadControl(operation, 24, local.parameters.pads.row5.pad51);
  handlePadControl(operation, 25, local.parameters.pads.row5.pad52);
  handlePadControl(operation, 26, local.parameters.pads.row5.pad53);
  handlePadControl(operation, 27, local.parameters.pads.row5.pad54);
  handlePadControl(operation, 28, local.parameters.pads.row5.pad55);
  handlePadControl(operation, 29, local.parameters.pads.row5.pad56);
  handlePadControl(operation, 30, local.parameters.pads.row5.pad57);
  handlePadControl(operation, 31, local.parameters.pads.row5.pad58);
  handlePadControl(operation, 16, local.parameters.pads.row6.pad61);
  handlePadControl(operation, 17, local.parameters.pads.row6.pad62);
  handlePadControl(operation, 18, local.parameters.pads.row6.pad63);
  handlePadControl(operation, 19, local.parameters.pads.row6.pad64);
  handlePadControl(operation, 20, local.parameters.pads.row6.pad65);
  handlePadControl(operation, 21, local.parameters.pads.row6.pad66);
  handlePadControl(operation, 22, local.parameters.pads.row6.pad67);
  handlePadControl(operation, 23, local.parameters.pads.row6.pad68);
  handlePadControl(operation, 8, local.parameters.pads.row7.pad71);
  handlePadControl(operation, 9, local.parameters.pads.row7.pad72);
  handlePadControl(operation, 10, local.parameters.pads.row7.pad73);
  handlePadControl(operation, 11, local.parameters.pads.row7.pad74);
  handlePadControl(operation, 12, local.parameters.pads.row7.pad75);
  handlePadControl(operation, 13, local.parameters.pads.row7.pad76);
  handlePadControl(operation, 14, local.parameters.pads.row7.pad77);
  handlePadControl(operation, 15, local.parameters.pads.row7.pad78);
  handlePadControl(operation, 0, local.parameters.pads.row8.pad81);
  handlePadControl(operation, 1, local.parameters.pads.row8.pad82);
  handlePadControl(operation, 2, local.parameters.pads.row8.pad83);
  handlePadControl(operation, 3, local.parameters.pads.row8.pad84);
  handlePadControl(operation, 4, local.parameters.pads.row8.pad85);
  handlePadControl(operation, 5, local.parameters.pads.row8.pad86);
  handlePadControl(operation, 6, local.parameters.pads.row8.pad87);
  handlePadControl(operation, 7, local.parameters.pads.row8.pad88);
}
var padLedEnabledControls = [];
var padColorModeControls = [];
var padColorControls = [];
var padPaletteModeControls = [];
var padOutputReady = false;
var registerPadControlOperation = 0;
var fullResyncPadControlOperation = 1;
var hardwarePaletteSolidChannel = 7;
var fullResyncExactMessage = [];
function initializePadOutput() {
  visitPadControls(registerPadControlOperation);
}
function handlePadControl(operation, note, controls) {
  if (operation == registerPadControlOperation) {
    registerPadOutput(note, controls);
    return;
  }
  if (operation == fullResyncPadControlOperation) {
    appendPadToFullResync(note, controls);
  }
}
function registerPadOutput(note, controls) {
  padLedEnabledControls[note] = controls.ledEnabled;
  padColorModeControls[note] = controls.colorMode;
  padColorControls[note] = controls.color;
  padPaletteModeControls[note] = controls.paletteMode;
}
function handlePadOutputParameterChange(parameter) {
  if (!padOutputReady) return;
  for (var note = sessionPadNoteMinimum; note <= sessionPadNoteMaximum; note += 1) {
    if (parameter.is(padLedEnabledControls[note])) {
      sendPadLedUpdate(note);
      return;
    }
    if (parameter.is(padColorModeControls[note])) {
      if (padLedEnabledControls[note].get()) sendPadLedUpdate(note);
      return;
    }
    if (parameter.is(padColorControls[note])) {
      if (padLedEnabledControls[note].get()) sendPadLedUpdate(note);
      return;
    }
    if (parameter.is(padPaletteModeControls[note])) {
      if (padLedEnabledControls[note].get() && padColorModeControls[note].get() == "palette") {
        sendPadLedUpdate(note);
      }
      return;
    }
  }
}
function markPadOutputInitializing() {
  padOutputReady = false;
}
function completePadOutputInitialization() {
  if (!isPadOutputConnected()) return;
  if (padOutputReady) return;
  padOutputReady = true;
  sendFullPadResync();
}
function fullResync() {
  if (!isPadOutputConnected()) {
    script.logWarning("Full Resync ignored: MIDI device is disconnected.");
    return;
  }
  if (!padOutputReady) {
    script.logWarning("Full Resync ignored: device initialization is still pending.");
    return;
  }
  sendFullPadResync();
}
function isPadOutputConnected() {
  return connectionControl.get() && selectedDevice(1) != "";
}
function sendPadLedUpdate(note) {
  var ledEnabled = padLedEnabledControls[note].get();
  if (!ledEnabled) {
    sendHardwarePalettePad(note, 0);
    logPadLedDisabled(note);
    return;
  }
  var requestedRgb = effectiveColorRgb(padColorControls[note].get());
  if (padColorModeControls[note].get() == "palette") {
    var paletteIndex = nearestHardwarePaletteIndex(requestedRgb);
    var selectedRgb = hardwarePaletteRgb(paletteIndex);
    sendHardwarePalettePad(note, paletteIndex);
    logPalettePadLedOutput(note, paletteIndex, selectedRgb, requestedRgb);
    return;
  }
  sendExactRgbPad(note, requestedRgb);
  logPadLedOutput(note, requestedRgb);
}
function sendFullPadResync() {
  fullResyncExactMessage = exactRgbMessageHeader(0);
  visitPadControls(fullResyncPadControlOperation);
  var dataLength = fullResyncExactMessage.length - 6;
  if (dataLength > 0) {
    fullResyncExactMessage[4] = dataLength >> 7 & 127;
    fullResyncExactMessage[5] = dataLength & 127;
    local.sendSysex(fullResyncExactMessage);
  }
  logFullPadResyncOutput();
}
function appendPadToFullResync(note, controls) {
  if (!controls.ledEnabled.get()) {
    sendHardwarePalettePad(note, 0);
    return;
  }
  var requestedRgb = effectiveColorRgb(controls.color.get());
  if (controls.colorMode.get() == "palette") {
    sendHardwarePalettePad(note, nearestHardwarePaletteIndex(requestedRgb));
    return;
  }
  appendExactRgbPadRecord(fullResyncExactMessage, note, requestedRgb);
}
function sendHardwarePalettePad(note, paletteIndex) {
  local.sendNoteOn(hardwarePaletteSolidChannel, note, paletteIndex);
}
function sendExactRgbPad(note, rgb) {
  var message = exactRgbMessageHeader(8);
  appendExactRgbPadRecord(message, note, rgb);
  local.sendSysex(message);
}
function exactRgbMessageHeader(dataLength) {
  return [
    akaiManufacturerId,
    127,
    apcProductId,
    36,
    dataLength >> 7 & 127,
    dataLength & 127
  ];
}
function appendExactRgbPadRecord(message, note, rgb) {
  message.push(note, note);
  appendSevenBitPair(message, rgb[0]);
  appendSevenBitPair(message, rgb[1]);
  appendSevenBitPair(message, rgb[2]);
}
function appendSevenBitPair(message, value) {
  message.push(value >> 7 & 127, value & 127);
}
function effectiveColorRgb(color) {
  var alpha = clampNormalized(color[3]);
  return [
    normalizedColorByte(color[0], alpha),
    normalizedColorByte(color[1], alpha),
    normalizedColorByte(color[2], alpha)
  ];
}
function normalizedColorByte(component, alpha) {
  return Math.round(clampNormalized(component) * alpha * 255);
}
function clampNormalized(value) {
  return Math.max(0, Math.min(1, value));
}
var padModeControl;
var currentPadMode = "unknown";
function initializePadMode() {
  padModeControl = local.values.status.padMode;
  currentPadMode = "unknown";
  padModeControl.setData(currentPadMode);
}
function isDrumPadMessage(channel, pitch) {
  return channel == drumMidiChannel && pitch >= drumPadNoteMinimum && pitch <= drumPadNoteMaximum;
}
function setPadMode(mode) {
  if (currentPadMode == mode) return;
  currentPadMode = mode;
  padModeControl.setData(mode);
  if (mode == "drum") {
    script.logWarning(
      "Drum Mode is not supported. Press Shift + Scene 6 to return to Session Mode."
    );
  } else if (mode == "note") {
    script.logWarning(
      "Note Mode is not supported. Press Shift + Scene 7 to return to Session Mode."
    );
  }
}
var deviceControls;
var connectionControl;
var previousInputDevice = "";
var wrongInputDeviceSelected = false;
var wrongDeviceWarningShown = false;
var introductionState = 0;
var introductionStateChangedAt = 0;
var introductionDelaySeconds = 0.1;
var introductionTimeoutSeconds = 1;
var introductionAttempts = 0;
var maximumIntroductionAttempts = 2;
function initializeConnection() {
  deviceControls = local.parameters.devices;
  connectionControl = local.parameters.isConnected;
  previousInputDevice = selectedDevice(0);
  resetPressedValues();
  validateSelectedDevices();
  scheduleIntroduction();
}
function handleIntroductionResponse(data) {
  var faderValues = decodeIntroductionFaders(data);
  if (faderValues.length != 9) {
    logInvalidIntroductionResponse(data.length);
    return;
  }
  if (isAmbiguousFaderSnapshot(faderValues)) {
    var willRetry = introductionAttempts < maximumIntroductionAttempts;
    logAmbiguousIntroductionResponse(willRetry);
    if (willRetry) {
      introductionState = 1;
      introductionStateChangedAt = util.getTime();
      return;
    }
    introductionState = 0;
    script.logWarning(
      "APC Mini mkII returned 127 for every fader during initialization. Keeping the last known positions until the faders are moved."
    );
    completePadOutputInitialization();
    return;
  }
  introductionState = 0;
  logSuccessfulIntroductionResponse(faderValues);
  for (var index = 0; index < faderValues.length; index += 1) {
    setFaderPosition(index, faderValues[index]);
  }
  completePadOutputInitialization();
}
function handleModuleParameterChange(parameter) {
  if (sameControl(parameter, deviceControls)) {
    handleDeviceChange();
    return;
  }
  if (sameControl(parameter, connectionControl)) {
    if (!connectionControl.get()) {
      resetPressedValues();
      setPadMode("unknown");
      introductionState = 0;
      markPadOutputInitializing();
      return;
    }
    scheduleIntroduction();
  }
}
function updateIntroduction() {
  if (introductionState == 0) return;
  var now = util.getTime();
  if (introductionState == 1 && now - introductionStateChangedAt >= introductionDelaySeconds) {
    introductionState = 2;
    introductionStateChangedAt = now;
    introductionAttempts += 1;
    logInitializationRequest(introductionAttempts);
    sendIntroductionRequest();
    return;
  }
  if (introductionState == 2 && now - introductionStateChangedAt >= introductionTimeoutSeconds) {
    introductionState = 0;
    script.logWarning(
      "APC Mini mkII did not respond to initialization. Incoming MIDI will continue, but initial fader positions may be unknown."
    );
    completePadOutputInitialization();
  }
}
function handleDeviceChange() {
  var inputDevice = selectedDevice(0);
  if (inputDevice != previousInputDevice) {
    resetPressedValues();
    setPadMode("unknown");
  }
  previousInputDevice = inputDevice;
  validateSelectedDevices();
  scheduleIntroduction();
}
function scheduleIntroduction() {
  markPadOutputInitializing();
  if (!connectionControl.get() || selectedDevice(0) == "" || selectedDevice(1) == "") {
    introductionState = 0;
    return;
  }
  introductionAttempts = 0;
  introductionState = 1;
  introductionStateChangedAt = util.getTime();
}
function isAmbiguousFaderSnapshot(values) {
  if (values.length != 9) return false;
  for (var index = 0; index < values.length; index += 1) {
    if (values[index] != 127) return false;
  }
  return true;
}
function selectedDevice(index) {
  var devices = deviceControls.get();
  if (!devices || devices.length <= index || !devices[index]) return "";
  return devices[index];
}
function validateSelectedDevices() {
  wrongInputDeviceSelected = isNotesDevice(selectedDevice(0));
  var wrongDeviceSelected = wrongInputDeviceSelected || isNotesDevice(selectedDevice(1));
  if (wrongDeviceSelected && !wrongDeviceWarningShown) {
    wrongDeviceWarningShown = true;
    script.logWarning(
      "Select APC mini mk2 Control for both MIDI input and output. The separate Notes port is not supported."
    );
  } else if (!wrongDeviceSelected) {
    wrongDeviceWarningShown = false;
  }
}
function isNotesDevice(identifier) {
  var normalized = identifier.toLowerCase();
  return normalized.indexOf("apc") >= 0 && normalized.indexOf("notes") >= 0;
}
function sameControl(first, second) {
  return first.is(second);
}
function init() {
  script.enableLog.set(true);
  script.setUpdateRate(20);
  initializeLogging();
  initializePadOutput();
  initializePadMode();
  initializeConnection();
  logCurrentClockState();
}
function noteOnEvent(channel, pitch, velocity) {
  if (isDrumPadMessage(channel, pitch)) {
    logDrumPadInput(pitch, velocity > 0);
    setPadMode("drum");
    return;
  }
  if (channel != sessionMidiChannel) {
    logUnrecognizedNoteInput("Note On", channel, pitch, velocity);
    return;
  }
  if (pitch >= sessionPadNoteMinimum && pitch <= sessionPadNoteMaximum) {
    if (wrongInputDeviceSelected) {
      logUnrecognizedNoteInput("Note On", channel, pitch, velocity);
      return;
    }
    var isPressed = velocity > 0;
    setSessionPadPressed(pitch, isPressed);
    logPadInput(pitch, isPressed);
    setPadMode("session");
    return;
  }
  var isButtonPressed = velocity > 0;
  if (setButtonPressed(pitch, isButtonPressed)) {
    logButtonInput(pitch, isButtonPressed);
  } else {
    logUnrecognizedNoteInput("Note On", channel, pitch, velocity);
  }
}
function noteOffEvent(channel, pitch, velocity) {
  if (isDrumPadMessage(channel, pitch)) {
    logDrumPadInput(pitch, false);
    setPadMode("drum");
    return;
  }
  if (channel != sessionMidiChannel) {
    logUnrecognizedNoteInput("Note Off", channel, pitch, velocity);
    return;
  }
  if (pitch >= sessionPadNoteMinimum && pitch <= sessionPadNoteMaximum) {
    if (wrongInputDeviceSelected) {
      logUnrecognizedNoteInput("Note Off", channel, pitch, velocity);
      return;
    }
    setSessionPadPressed(pitch, false);
    logPadInput(pitch, false);
    setPadMode("session");
    return;
  }
  if (setButtonPressed(pitch, false)) {
    logButtonInput(pitch, false);
  } else {
    logUnrecognizedNoteInput("Note Off", channel, pitch, velocity);
  }
}
function ccEvent(channel, number, value) {
  if (channel != sessionMidiChannel || number < faderCcMinimum || number > faderCcMaximum) {
    logUnrecognizedCcInput(channel, number, value);
    return;
  }
  var faderIndex = number - faderCcMinimum;
  setFaderPosition(faderIndex, value);
  logFaderInput(faderIndex, value);
}
function sysExEvent(data) {
  var mode = decodePadMode(data);
  if (mode != "") {
    setPadMode(mode);
    logPadModeInput(mode);
    return;
  }
  if (isApcSysex(data, introductionResponseId)) {
    handleIntroductionResponse(data);
  } else {
    logUnrecognizedSysexInput(data);
  }
}
function moduleParameterChanged(parameter) {
  handleLoggingParameterChange(parameter);
  handlePadOutputParameterChange(parameter);
  handleModuleParameterChange(parameter);
}
function update(_deltaTime) {
  updateIntroduction();
}
