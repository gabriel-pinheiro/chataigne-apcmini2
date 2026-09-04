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
  script.log(
    "Pad LED Updated: " + padLabel(note) + " = #" + formatHexByte(rgb[0]) + formatHexByte(rgb[1]) + formatHexByte(rgb[2])
  );
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
var padLedEnabledControls = [];
var padColorModeControls = [];
var padColorControls = [];
var padOutputReady = false;
function initializePadOutput() {
  registerPadOutput(56, local.parameters.pads.row1.pad11);
  registerPadOutput(57, local.parameters.pads.row1.pad12);
  registerPadOutput(58, local.parameters.pads.row1.pad13);
  registerPadOutput(59, local.parameters.pads.row1.pad14);
  registerPadOutput(60, local.parameters.pads.row1.pad15);
  registerPadOutput(61, local.parameters.pads.row1.pad16);
  registerPadOutput(62, local.parameters.pads.row1.pad17);
  registerPadOutput(63, local.parameters.pads.row1.pad18);
  registerPadOutput(48, local.parameters.pads.row2.pad21);
  registerPadOutput(49, local.parameters.pads.row2.pad22);
  registerPadOutput(50, local.parameters.pads.row2.pad23);
  registerPadOutput(51, local.parameters.pads.row2.pad24);
  registerPadOutput(52, local.parameters.pads.row2.pad25);
  registerPadOutput(53, local.parameters.pads.row2.pad26);
  registerPadOutput(54, local.parameters.pads.row2.pad27);
  registerPadOutput(55, local.parameters.pads.row2.pad28);
  registerPadOutput(40, local.parameters.pads.row3.pad31);
  registerPadOutput(41, local.parameters.pads.row3.pad32);
  registerPadOutput(42, local.parameters.pads.row3.pad33);
  registerPadOutput(43, local.parameters.pads.row3.pad34);
  registerPadOutput(44, local.parameters.pads.row3.pad35);
  registerPadOutput(45, local.parameters.pads.row3.pad36);
  registerPadOutput(46, local.parameters.pads.row3.pad37);
  registerPadOutput(47, local.parameters.pads.row3.pad38);
  registerPadOutput(32, local.parameters.pads.row4.pad41);
  registerPadOutput(33, local.parameters.pads.row4.pad42);
  registerPadOutput(34, local.parameters.pads.row4.pad43);
  registerPadOutput(35, local.parameters.pads.row4.pad44);
  registerPadOutput(36, local.parameters.pads.row4.pad45);
  registerPadOutput(37, local.parameters.pads.row4.pad46);
  registerPadOutput(38, local.parameters.pads.row4.pad47);
  registerPadOutput(39, local.parameters.pads.row4.pad48);
  registerPadOutput(24, local.parameters.pads.row5.pad51);
  registerPadOutput(25, local.parameters.pads.row5.pad52);
  registerPadOutput(26, local.parameters.pads.row5.pad53);
  registerPadOutput(27, local.parameters.pads.row5.pad54);
  registerPadOutput(28, local.parameters.pads.row5.pad55);
  registerPadOutput(29, local.parameters.pads.row5.pad56);
  registerPadOutput(30, local.parameters.pads.row5.pad57);
  registerPadOutput(31, local.parameters.pads.row5.pad58);
  registerPadOutput(16, local.parameters.pads.row6.pad61);
  registerPadOutput(17, local.parameters.pads.row6.pad62);
  registerPadOutput(18, local.parameters.pads.row6.pad63);
  registerPadOutput(19, local.parameters.pads.row6.pad64);
  registerPadOutput(20, local.parameters.pads.row6.pad65);
  registerPadOutput(21, local.parameters.pads.row6.pad66);
  registerPadOutput(22, local.parameters.pads.row6.pad67);
  registerPadOutput(23, local.parameters.pads.row6.pad68);
  registerPadOutput(8, local.parameters.pads.row7.pad71);
  registerPadOutput(9, local.parameters.pads.row7.pad72);
  registerPadOutput(10, local.parameters.pads.row7.pad73);
  registerPadOutput(11, local.parameters.pads.row7.pad74);
  registerPadOutput(12, local.parameters.pads.row7.pad75);
  registerPadOutput(13, local.parameters.pads.row7.pad76);
  registerPadOutput(14, local.parameters.pads.row7.pad77);
  registerPadOutput(15, local.parameters.pads.row7.pad78);
  registerPadOutput(0, local.parameters.pads.row8.pad81);
  registerPadOutput(1, local.parameters.pads.row8.pad82);
  registerPadOutput(2, local.parameters.pads.row8.pad83);
  registerPadOutput(3, local.parameters.pads.row8.pad84);
  registerPadOutput(4, local.parameters.pads.row8.pad85);
  registerPadOutput(5, local.parameters.pads.row8.pad86);
  registerPadOutput(6, local.parameters.pads.row8.pad87);
  registerPadOutput(7, local.parameters.pads.row8.pad88);
}
function registerPadOutput(note, controls) {
  padLedEnabledControls[note] = controls.ledEnabled;
  padColorModeControls[note] = controls.colorMode;
  padColorControls[note] = controls.color;
}
function handlePadOutputParameterChange(parameter) {
  if (!padOutputReady) return;
  for (var note = sessionPadNoteMinimum; note <= sessionPadNoteMaximum; note += 1) {
    if (parameter.is(padLedEnabledControls[note]) || parameter.is(padColorModeControls[note])) {
      sendPadLedUpdate(note);
      return;
    }
    if (parameter.is(padColorControls[note])) {
      if (padLedEnabledControls[note].get() && padColorModeControls[note].get() == "rgb") {
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
  var rgb = effectivePadRgb(note);
  var message = exactRgbMessageHeader(8);
  appendExactRgbPadRecord(message, note, rgb);
  local.sendSysex(message);
  logPadLedOutput(note, rgb);
}
function sendFullPadResync() {
  var message = exactRgbMessageHeader(8 * 64);
  appendPadLedFromControls(message, 56, local.parameters.pads.row1.pad11);
  appendPadLedFromControls(message, 57, local.parameters.pads.row1.pad12);
  appendPadLedFromControls(message, 58, local.parameters.pads.row1.pad13);
  appendPadLedFromControls(message, 59, local.parameters.pads.row1.pad14);
  appendPadLedFromControls(message, 60, local.parameters.pads.row1.pad15);
  appendPadLedFromControls(message, 61, local.parameters.pads.row1.pad16);
  appendPadLedFromControls(message, 62, local.parameters.pads.row1.pad17);
  appendPadLedFromControls(message, 63, local.parameters.pads.row1.pad18);
  appendPadLedFromControls(message, 48, local.parameters.pads.row2.pad21);
  appendPadLedFromControls(message, 49, local.parameters.pads.row2.pad22);
  appendPadLedFromControls(message, 50, local.parameters.pads.row2.pad23);
  appendPadLedFromControls(message, 51, local.parameters.pads.row2.pad24);
  appendPadLedFromControls(message, 52, local.parameters.pads.row2.pad25);
  appendPadLedFromControls(message, 53, local.parameters.pads.row2.pad26);
  appendPadLedFromControls(message, 54, local.parameters.pads.row2.pad27);
  appendPadLedFromControls(message, 55, local.parameters.pads.row2.pad28);
  appendPadLedFromControls(message, 40, local.parameters.pads.row3.pad31);
  appendPadLedFromControls(message, 41, local.parameters.pads.row3.pad32);
  appendPadLedFromControls(message, 42, local.parameters.pads.row3.pad33);
  appendPadLedFromControls(message, 43, local.parameters.pads.row3.pad34);
  appendPadLedFromControls(message, 44, local.parameters.pads.row3.pad35);
  appendPadLedFromControls(message, 45, local.parameters.pads.row3.pad36);
  appendPadLedFromControls(message, 46, local.parameters.pads.row3.pad37);
  appendPadLedFromControls(message, 47, local.parameters.pads.row3.pad38);
  appendPadLedFromControls(message, 32, local.parameters.pads.row4.pad41);
  appendPadLedFromControls(message, 33, local.parameters.pads.row4.pad42);
  appendPadLedFromControls(message, 34, local.parameters.pads.row4.pad43);
  appendPadLedFromControls(message, 35, local.parameters.pads.row4.pad44);
  appendPadLedFromControls(message, 36, local.parameters.pads.row4.pad45);
  appendPadLedFromControls(message, 37, local.parameters.pads.row4.pad46);
  appendPadLedFromControls(message, 38, local.parameters.pads.row4.pad47);
  appendPadLedFromControls(message, 39, local.parameters.pads.row4.pad48);
  appendPadLedFromControls(message, 24, local.parameters.pads.row5.pad51);
  appendPadLedFromControls(message, 25, local.parameters.pads.row5.pad52);
  appendPadLedFromControls(message, 26, local.parameters.pads.row5.pad53);
  appendPadLedFromControls(message, 27, local.parameters.pads.row5.pad54);
  appendPadLedFromControls(message, 28, local.parameters.pads.row5.pad55);
  appendPadLedFromControls(message, 29, local.parameters.pads.row5.pad56);
  appendPadLedFromControls(message, 30, local.parameters.pads.row5.pad57);
  appendPadLedFromControls(message, 31, local.parameters.pads.row5.pad58);
  appendPadLedFromControls(message, 16, local.parameters.pads.row6.pad61);
  appendPadLedFromControls(message, 17, local.parameters.pads.row6.pad62);
  appendPadLedFromControls(message, 18, local.parameters.pads.row6.pad63);
  appendPadLedFromControls(message, 19, local.parameters.pads.row6.pad64);
  appendPadLedFromControls(message, 20, local.parameters.pads.row6.pad65);
  appendPadLedFromControls(message, 21, local.parameters.pads.row6.pad66);
  appendPadLedFromControls(message, 22, local.parameters.pads.row6.pad67);
  appendPadLedFromControls(message, 23, local.parameters.pads.row6.pad68);
  appendPadLedFromControls(message, 8, local.parameters.pads.row7.pad71);
  appendPadLedFromControls(message, 9, local.parameters.pads.row7.pad72);
  appendPadLedFromControls(message, 10, local.parameters.pads.row7.pad73);
  appendPadLedFromControls(message, 11, local.parameters.pads.row7.pad74);
  appendPadLedFromControls(message, 12, local.parameters.pads.row7.pad75);
  appendPadLedFromControls(message, 13, local.parameters.pads.row7.pad76);
  appendPadLedFromControls(message, 14, local.parameters.pads.row7.pad77);
  appendPadLedFromControls(message, 15, local.parameters.pads.row7.pad78);
  appendPadLedFromControls(message, 0, local.parameters.pads.row8.pad81);
  appendPadLedFromControls(message, 1, local.parameters.pads.row8.pad82);
  appendPadLedFromControls(message, 2, local.parameters.pads.row8.pad83);
  appendPadLedFromControls(message, 3, local.parameters.pads.row8.pad84);
  appendPadLedFromControls(message, 4, local.parameters.pads.row8.pad85);
  appendPadLedFromControls(message, 5, local.parameters.pads.row8.pad86);
  appendPadLedFromControls(message, 6, local.parameters.pads.row8.pad87);
  appendPadLedFromControls(message, 7, local.parameters.pads.row8.pad88);
  local.sendSysex(message);
  logFullPadResyncOutput();
}
function appendPadLedFromControls(message, note, controls) {
  appendExactRgbPadRecord(message, note, effectivePadRgbFromControls(controls));
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
function effectivePadRgb(note) {
  return effectiveRgbValues(
    padLedEnabledControls[note].get(),
    padColorModeControls[note].get(),
    padColorControls[note].get()
  );
}
function effectivePadRgbFromControls(controls) {
  return effectiveRgbValues(
    controls.ledEnabled.get(),
    controls.colorMode.get(),
    controls.color.get()
  );
}
function effectiveRgbValues(ledEnabled, colorMode, color) {
  if (!ledEnabled || colorMode != "rgb") {
    return [0, 0, 0];
  }
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
