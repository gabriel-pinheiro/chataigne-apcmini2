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
var universalNonRealtimeId = 126;
var identityMessageId = 6;
var identityRequestId = 1;
var identityReplyId = 2;
var introductionRequestId = 96;
var introductionResponseId = 97;
var padModeMessageId = 98;
function isApcSysex(data, messageId) {
  return data.length >= 4 && data[0] == akaiManufacturerId && data[1] == 127 && data[2] == apcProductId && data[3] == messageId;
}
function isIdentityReply(data) {
  return data.length >= 4 && data[0] == universalNonRealtimeId && data[2] == identityMessageId && data[3] == identityReplyId;
}
function isApcIdentityReply(data) {
  return isIdentityReply(data) && data.length >= 6 && data[4] == akaiManufacturerId && data[5] == apcProductId;
}
function decodePadMode(data) {
  if (!isApcSysex(data, padModeMessageId) || data.length < 7) return "";
  var mode = data[6];
  if (mode == 0) return "session";
  if (mode == 1) return "note";
  if (mode == 2) return "drum";
  if (mode == 3) return "node_edit";
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
function sendIdentityRequest() {
  local.sendSysex(
    universalNonRealtimeId,
    0,
    identityMessageId,
    identityRequestId
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
var moduleClockControls;
var midiClockControls;
var midiClockInitialized = false;
var midiClockReady = false;
function initializeClock() {
  moduleClockControls = local.parameters.clock;
  midiClockControls = local.values.tempo;
  midiClockControls.sendClock.setAttribute("readOnly", true);
  midiClockControls.bpm.setAttribute("readOnly", true);
  midiClockInitialized = true;
  midiClockReady = false;
  midiClockControls.sendClock.set(false);
  midiClockControls.bpm.set(moduleClockControls.bpm.get());
}
function handleClockParameterChange(parameter) {
  if (parameter.is(moduleClockControls.sendClock) || parameter.is(moduleClockControls.bpm)) {
    synchronizeMidiClock();
  }
}
function synchronizeMidiClock() {
  if (!midiClockInitialized) return;
  midiClockControls.bpm.set(moduleClockControls.bpm.get());
  if (midiClockReady) {
    midiClockControls.sendClock.set(moduleClockControls.sendClock.get());
  } else if (midiClockControls.sendClock.get()) {
    midiClockControls.sendClock.set(false);
  }
}
function markMidiClockInitializing() {
  if (!midiClockInitialized) return;
  midiClockReady = false;
  if (midiClockControls.sendClock.get()) {
    midiClockControls.sendClock.set(false);
  }
}
function completeMidiClockInitialization() {
  if (!midiClockInitialized || midiClockReady) return;
  midiClockReady = true;
  if (midiClockControls.sendClock.get()) {
    midiClockControls.sendClock.set(false);
  }
  midiClockControls.bpm.set(moduleClockControls.bpm.get());
  midiClockControls.sendClock.set(moduleClockControls.sendClock.get());
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
  script.log("Introduction Response Invalid: " + byteCount + " payload bytes");
}
function logAmbiguousIntroductionResponse(willRetry) {
  if (!interpretedInputLogControl.get()) return;
  if (willRetry) {
    script.log("Introduction Response: all faders returned 127; retrying");
  } else {
    script.log("Introduction Response: all faders returned 127; keeping last known values");
  }
}
function logSuccessfulIntroductionResponse(values) {
  if (!interpretedInputLogControl.get()) return;
  var message = "Introduction Complete: ";
  for (var index = 0; index < values.length; index += 1) {
    if (index > 0) message += ", ";
    message += faderLabel(index) + " = " + formatMidiValue(values[index]);
  }
  script.log(message);
}
function logIdentityRequest() {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Identity Request Sent");
}
function logIdentityReply(data, isApc) {
  if (!interpretedInputLogControl.get()) return;
  if (!isApc) {
    script.log(
      "Identity Reply: manufacturer " + (data.length >= 5 ? data[4] : "unknown") + ", product " + (data.length >= 6 ? data[5] : "unknown")
    );
    return;
  }
  var revision = data.length >= 12 ? formatByteRange(data, 8, 4) : "unavailable";
  var deviceId = data.length >= 13 ? "" + data[12] : "unavailable";
  script.log(
    "Identity Reply: APC Mini mkII, software revision bytes [" + revision + "], device ID " + deviceId
  );
}
function logIntroductionRequest(attempt) {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Introduction Request Sent: attempt " + attempt);
}
function logPadLedOutput(note, rgb) {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Pad LED Updated: " + padLabel(note) + " = " + formatRgbHex(rgb));
}
function logPalettePadLedOutput(note, paletteIndex, selectedRgb, requestedRgb, paletteModeLabel) {
  if (!interpretedOutputLogControl.get()) return;
  script.log(
    "Pad LED Updated: " + padLabel(note) + " = Palette " + paletteIndex + " " + formatRgbHex(selectedRgb) + ", " + paletteModeLabel + " (requested " + formatRgbHex(requestedRgb) + ")"
  );
}
function logPadLedDisabled(note) {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Pad LED Disabled: " + padLabel(note));
}
function logButtonLedOutput(note, modeLabel) {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Button LED Updated: " + buttonLabel(note) + " = " + modeLabel);
}
function logFullControllerResyncOutput() {
  if (!interpretedOutputLogControl.get()) return;
  script.log("Full Resync Sent: 64 pad LEDs, 16 button LEDs");
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
  if (mode == "node_edit") return "Note Edit";
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
function formatByteRange(values, start, count) {
  var result = "";
  var end = Math.min(values.length, start + count);
  for (var index = start; index < end; index += 1) {
    if (result != "") result += ", ";
    result += values[index];
  }
  return result;
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
function hardwarePaletteModeChannel(mode) {
  if (mode == "solid10") return 1;
  if (mode == "solid25") return 2;
  if (mode == "solid50") return 3;
  if (mode == "solid65") return 4;
  if (mode == "solid75") return 5;
  if (mode == "solid90") return 6;
  if (mode == "pulse16") return 8;
  if (mode == "pulse8") return 9;
  if (mode == "pulse4") return 10;
  if (mode == "pulse2") return 11;
  if (mode == "blink24") return 12;
  if (mode == "blink16") return 13;
  if (mode == "blink8") return 14;
  if (mode == "blink4") return 15;
  if (mode == "blink2") return 16;
  return 7;
}
function hardwarePaletteModeLabel(mode) {
  if (mode == "solid10") return "Solid - 10%";
  if (mode == "solid25") return "Solid - 25%";
  if (mode == "solid50") return "Solid - 50%";
  if (mode == "solid65") return "Solid - 65%";
  if (mode == "solid75") return "Solid - 75%";
  if (mode == "solid90") return "Solid - 90%";
  if (mode == "pulse16") return "Pulse - 1/16";
  if (mode == "pulse8") return "Pulse - 1/8";
  if (mode == "pulse4") return "Pulse - 1/4";
  if (mode == "pulse2") return "Pulse - 1/2";
  if (mode == "blink24") return "Blink - 1/24";
  if (mode == "blink16") return "Blink - 1/16";
  if (mode == "blink8") return "Blink - 1/8";
  if (mode == "blink4") return "Blink - 1/4";
  if (mode == "blink2") return "Blink - 1/2";
  return "Solid - 100%";
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
var registerPadControlOperation = 0;
var fullResyncPadControlOperation = 1;
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
  if (!controllerOutputReady) return;
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
function sendPadLedUpdate(note) {
  var ledEnabled = padLedEnabledControls[note].get();
  if (!ledEnabled) {
    sendHardwarePalettePad(note, 0, "solid100");
    logPadLedDisabled(note);
    return;
  }
  var requestedRgb = effectiveColorRgb(padColorControls[note].get());
  if (padColorModeControls[note].get() == "palette") {
    var paletteIndex = nearestHardwarePaletteIndex(requestedRgb);
    var selectedRgb = hardwarePaletteRgb(paletteIndex);
    var paletteMode = padPaletteModeControls[note].get();
    sendHardwarePalettePad(note, paletteIndex, paletteMode);
    logPalettePadLedOutput(
      note,
      paletteIndex,
      selectedRgb,
      requestedRgb,
      hardwarePaletteModeLabel(paletteMode)
    );
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
}
function appendPadToFullResync(note, controls) {
  if (!controls.ledEnabled.get()) {
    sendHardwarePalettePad(note, 0, "solid100");
    return;
  }
  var requestedRgb = effectiveColorRgb(controls.color.get());
  if (controls.colorMode.get() == "palette") {
    sendHardwarePalettePad(
      note,
      nearestHardwarePaletteIndex(requestedRgb),
      controls.paletteMode.get()
    );
    return;
  }
  appendExactRgbPadRecord(fullResyncExactMessage, note, requestedRgb);
}
function sendHardwarePalettePad(note, paletteIndex, paletteMode) {
  local.sendNoteOn(hardwarePaletteModeChannel(paletteMode), note, paletteIndex);
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
function visitButtonLedControls(operation) {
  handleButtonLedControl(operation, 100, local.parameters.buttons.trackButtons.track1.ledMode);
  handleButtonLedControl(operation, 101, local.parameters.buttons.trackButtons.track2.ledMode);
  handleButtonLedControl(operation, 102, local.parameters.buttons.trackButtons.track3.ledMode);
  handleButtonLedControl(operation, 103, local.parameters.buttons.trackButtons.track4.ledMode);
  handleButtonLedControl(operation, 104, local.parameters.buttons.trackButtons.track5.ledMode);
  handleButtonLedControl(operation, 105, local.parameters.buttons.trackButtons.track6.ledMode);
  handleButtonLedControl(operation, 106, local.parameters.buttons.trackButtons.track7.ledMode);
  handleButtonLedControl(operation, 107, local.parameters.buttons.trackButtons.track8.ledMode);
  handleButtonLedControl(operation, 112, local.parameters.buttons.sceneButtons.scene1.ledMode);
  handleButtonLedControl(operation, 113, local.parameters.buttons.sceneButtons.scene2.ledMode);
  handleButtonLedControl(operation, 114, local.parameters.buttons.sceneButtons.scene3.ledMode);
  handleButtonLedControl(operation, 115, local.parameters.buttons.sceneButtons.scene4.ledMode);
  handleButtonLedControl(operation, 116, local.parameters.buttons.sceneButtons.scene5.ledMode);
  handleButtonLedControl(operation, 117, local.parameters.buttons.sceneButtons.scene6.ledMode);
  handleButtonLedControl(operation, 118, local.parameters.buttons.sceneButtons.scene7.ledMode);
  handleButtonLedControl(operation, 119, local.parameters.buttons.sceneButtons.scene8.ledMode);
}
var buttonLedModeControls = [];
var registerButtonLedOperation = 0;
var resyncButtonLedOperation = 1;
var peripheralLedMidiChannel = 1;
function initializeButtonOutput() {
  visitButtonLedControls(registerButtonLedOperation);
}
function handleButtonLedControl(operation, note, control) {
  if (operation == registerButtonLedOperation) {
    buttonLedModeControls[note] = control;
    return;
  }
  if (operation == resyncButtonLedOperation) {
    sendButtonLed(note, control.get());
  }
}
function handleButtonOutputParameterChange(parameter) {
  if (!controllerOutputReady) return;
  for (var note = trackButtonNoteMinimum; note <= trackButtonNoteMaximum; note += 1) {
    if (parameter.is(buttonLedModeControls[note])) {
      sendButtonLedUpdate(note);
      return;
    }
  }
  for (var note = sceneButtonNoteMinimum; note <= sceneButtonNoteMaximum; note += 1) {
    if (parameter.is(buttonLedModeControls[note])) {
      sendButtonLedUpdate(note);
      return;
    }
  }
}
function sendButtonLedUpdate(note) {
  var mode = buttonLedModeControls[note].get();
  sendButtonLed(note, mode);
  logButtonLedOutput(note, buttonLedModeLabel(mode));
}
function sendFullButtonResync() {
  visitButtonLedControls(resyncButtonLedOperation);
}
function sendButtonLed(note, mode) {
  local.sendNoteOn(peripheralLedMidiChannel, note, buttonLedModeVelocity(mode));
}
function buttonLedModeVelocity(mode) {
  if (mode == "on") return 1;
  if (mode == "blink") return 2;
  return 0;
}
function buttonLedModeLabel(mode) {
  if (mode == "on") return "On";
  if (mode == "blink") return "Blink";
  return "Off";
}
var controllerOutputReady = false;
function initializeControllerOutput() {
  initializePadOutput();
  initializeButtonOutput();
}
function handleControllerOutputParameterChange(parameter) {
  handlePadOutputParameterChange(parameter);
  handleButtonOutputParameterChange(parameter);
}
function markControllerOutputInitializing() {
  controllerOutputReady = false;
}
function completeControllerOutputInitialization() {
  if (!isControllerOutputConnected() || controllerOutputReady) return;
  controllerOutputReady = true;
  sendFullControllerResync();
}
function fullResync() {
  if (!isControllerOutputConnected()) {
    script.logWarning("Full Resync ignored: MIDI device is disconnected.");
    return;
  }
  if (!controllerOutputReady) {
    script.logWarning("Full Resync ignored: device initialization is still pending.");
    return;
  }
  sendFullControllerResync();
}
function isControllerOutputConnected() {
  return connectionControl.get() && selectedDevice(1) != "";
}
function sendFullControllerResync() {
  sendFullPadResync();
  sendFullButtonResync();
  logFullControllerResyncOutput();
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
  } else if (mode == "node_edit") {
    script.logWarning(
      "Note Edit Mode is not supported. Press Shift + Scene 7 to return to Session Mode."
    );
  }
}
var deviceControls;
var connectionControl;
var previousInputDevice = "";
var wrongInputDeviceSelected = false;
var currentDeviceConfigurationWarning = "";
var invalidInitialMidiInputValue = "MIDI Devices to connect to";
var introductionState = 0;
var introductionStateChangedAt = 0;
var deviceSettleDelaySeconds = 0.1;
var identityReplyTimeoutSeconds = 0.5;
var introductionRetryDelaySeconds = 0.5;
var ambiguousFaderRetryDelaySeconds = 0.1;
var introductionAttempts = 0;
var maximumIntroductionAttempts = 2;
var identityResult = "not requested";
function initializeConnection() {
  deviceControls = local.parameters.devices;
  connectionControl = local.parameters.isConnected;
  previousInputDevice = selectedDevice(0);
  resetPressedValues();
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
      introductionState = 4;
      introductionStateChangedAt = util.getTime();
      return;
    }
    introductionState = 0;
    script.logWarning(
      "APC Mini mkII returned 127 for every fader during initialization. Keeping the last known positions until the faders are moved."
    );
    completeDeviceInitialization();
    return;
  }
  introductionState = 0;
  logSuccessfulIntroductionResponse(faderValues);
  for (var index = 0; index < faderValues.length; index += 1) {
    setFaderPosition(index, faderValues[index]);
  }
  completeDeviceInitialization();
}
function handleIdentityReply(data) {
  var isApc = isApcIdentityReply(data);
  logIdentityReply(data, isApc);
  if (introductionState != 2) return;
  if (!isApc) {
    introductionState = 0;
    script.logWarning(
      "The selected MIDI device returned an Identity Reply, but it is not an APC mini mk2. Initialization was blocked."
    );
    return;
  }
  identityResult = "APC mini mk2 reply";
  sendIntroductionAttempt(util.getTime());
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
    }
    scheduleIntroduction();
  }
}
function updateIntroduction() {
  if (introductionState == 0) return;
  var now = util.getTime();
  if (introductionState == 1 && now - introductionStateChangedAt >= deviceSettleDelaySeconds) {
    beginIntroductionAfterDeviceSettle(now);
    return;
  }
  if (introductionState == 2 && now - introductionStateChangedAt >= identityReplyTimeoutSeconds) {
    identityResult = "no reply after " + Math.round(identityReplyTimeoutSeconds * 1e3) + " ms";
    script.logWarning(
      "APC Mini mkII did not respond to Identity Request after " + Math.round(identityReplyTimeoutSeconds * 1e3) + " ms. Continuing with Introduction."
    );
    sendIntroductionAttempt(now);
    return;
  }
  if (introductionState == 3 && now - introductionStateChangedAt >= introductionRetryDelaySeconds) {
    if (introductionAttempts < maximumIntroductionAttempts) {
      sendIntroductionAttempt(now);
      return;
    }
    introductionState = 0;
    logIntroductionTimeoutWarning();
    completeDeviceInitialization();
    return;
  }
  if (introductionState == 4 && now - introductionStateChangedAt >= ambiguousFaderRetryDelaySeconds) {
    sendIntroductionAttempt(now);
  }
}
function handleDeviceChange() {
  var inputDevice = selectedDevice(0);
  if (inputDevice != previousInputDevice) {
    resetPressedValues();
    setPadMode("unknown");
  }
  previousInputDevice = inputDevice;
  scheduleIntroduction();
}
function scheduleIntroduction() {
  markControllerOutputInitializing();
  markMidiClockInitializing();
  introductionAttempts = 0;
  identityResult = "not requested";
  introductionState = 1;
  introductionStateChangedAt = util.getTime();
}
function beginIntroductionAfterDeviceSettle(now) {
  var inputDevice = selectedDevice(0);
  var outputDevice = selectedDevice(1);
  if (!validateSelectedDevices(inputDevice, outputDevice) || !connectionControl.get() || inputDevice == "" || outputDevice == "") {
    introductionState = 0;
    return;
  }
  sendIdentityRequestForInitialization(now);
}
function sendIdentityRequestForInitialization(now) {
  introductionState = 2;
  introductionStateChangedAt = now;
  logIdentityRequest();
  sendIdentityRequest();
}
function sendIntroductionAttempt(now) {
  introductionState = 3;
  introductionStateChangedAt = now;
  introductionAttempts += 1;
  logIntroductionRequest(introductionAttempts);
  sendIntroductionRequest();
}
function logIntroductionTimeoutWarning() {
  if (identityResult == "APC mini mk2 reply") {
    script.logWarning(
      "APC Mini mkII identity succeeded, but Introduction did not respond. The Notes port or mismatched MIDI input and output ports are probably selected. Select APC mini mk2 Control for both MIDI devices. Incoming MIDI and LED output will continue, but initial fader positions may be unknown."
    );
    return;
  }
  script.logWarning(
    "The selected MIDI device did not respond to APC Mini mkII Identity or Introduction. Verify that APC mini mk2 Control is selected for both MIDI devices. Incoming MIDI and LED output will continue, but initial fader positions may be unknown."
  );
}
function completeDeviceInitialization() {
  completeControllerOutputInitialization();
  completeMidiClockInitialization();
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
  var device = "" + devices[index];
  if (index == 0 && device == invalidInitialMidiInputValue) return "";
  return device;
}
function validateSelectedDevices(inputDevice, outputDevice) {
  var inputIsNotes = inputDevice != "" && isNotesDevice(inputDevice);
  var outputIsNotes = outputDevice != "" && isNotesDevice(outputDevice);
  wrongInputDeviceSelected = inputIsNotes;
  if (inputDevice == "" && outputDevice == "") {
    setDeviceConfigurationWarning("");
    return false;
  }
  if (inputIsNotes || outputIsNotes) {
    setDeviceConfigurationWarning("notes");
    return false;
  }
  if (inputDevice == "") {
    setDeviceConfigurationWarning("missingInput");
    return false;
  }
  if (outputDevice == "") {
    setDeviceConfigurationWarning("missingOutput");
    return false;
  }
  setDeviceConfigurationWarning("");
  return true;
}
function setDeviceConfigurationWarning(problem) {
  if (problem == currentDeviceConfigurationWarning) return;
  currentDeviceConfigurationWarning = problem;
  if (problem == "missingInput") {
    script.logWarning(
      "MIDI input is not selected. Select APC mini mk2 Control for both MIDI input and output."
    );
  } else if (problem == "missingOutput") {
    script.logWarning(
      "MIDI output is not selected. Select APC mini mk2 Control for both MIDI input and output."
    );
  } else if (problem == "notes") {
    script.logWarning(
      "The APC mini mk2 Notes port is not supported. Select APC mini mk2 Control for both MIDI input and output."
    );
  }
}
function isNotesDevice(name) {
  return name.toLowerCase().indexOf("notes") >= 0;
}
function sameControl(first, second) {
  return first.is(second);
}
function init() {
  script.enableLog.set(true);
  script.setUpdateRate(20);
  initializeLogging();
  initializeControllerOutput();
  initializePadMode();
  initializeConnection();
  initializeClock();
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
  if (isIdentityReply(data)) {
    handleIdentityReply(data);
    return;
  }
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
  handleClockParameterChange(parameter);
  handleLoggingParameterChange(parameter);
  handleControllerOutputParameterChange(parameter);
  handleModuleParameterChange(parameter);
}
function update(_deltaTime) {
  updateIntroduction();
}
