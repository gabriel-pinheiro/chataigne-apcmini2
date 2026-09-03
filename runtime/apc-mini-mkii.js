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
  if (faderValues.length != 9) return;
  if (isAmbiguousFaderSnapshot(faderValues)) {
    if (introductionAttempts < maximumIntroductionAttempts) {
      introductionState = 1;
      introductionStateChangedAt = util.getTime();
      return;
    }
    introductionState = 0;
    script.logWarning(
      "APC Mini mkII returned 127 for every fader during initialization. Keeping the last known positions until the faders are moved."
    );
    return;
  }
  introductionState = 0;
  for (var index = 0; index < faderValues.length; index += 1) {
    setFaderPosition(index, faderValues[index]);
  }
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
    sendIntroductionRequest();
    return;
  }
  if (introductionState == 2 && now - introductionStateChangedAt >= introductionTimeoutSeconds) {
    introductionState = 0;
    script.logWarning(
      "APC Mini mkII did not respond to initialization. Incoming MIDI will continue, but initial fader positions may be unknown."
    );
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
  initializePadMode();
  initializeConnection();
}
function noteOnEvent(channel, pitch, velocity) {
  if (isDrumPadMessage(channel, pitch)) {
    setPadMode("drum");
    return;
  }
  if (channel != sessionMidiChannel) return;
  if (pitch >= sessionPadNoteMinimum && pitch <= sessionPadNoteMaximum) {
    if (wrongInputDeviceSelected) return;
    setSessionPadPressed(pitch, velocity > 0);
    setPadMode("session");
    return;
  }
  setButtonPressed(pitch, velocity > 0);
}
function noteOffEvent(channel, pitch, _velocity) {
  if (isDrumPadMessage(channel, pitch)) {
    setPadMode("drum");
    return;
  }
  if (channel != sessionMidiChannel) return;
  if (pitch >= sessionPadNoteMinimum && pitch <= sessionPadNoteMaximum) {
    if (wrongInputDeviceSelected) return;
    setSessionPadPressed(pitch, false);
    setPadMode("session");
    return;
  }
  setButtonPressed(pitch, false);
}
function ccEvent(channel, number, value) {
  if (channel != sessionMidiChannel) return;
  if (number < faderCcMinimum || number > faderCcMaximum) return;
  setFaderPosition(number - faderCcMinimum, value);
}
function sysExEvent(data) {
  var mode = decodePadMode(data);
  if (mode != "") {
    setPadMode(mode);
    return;
  }
  handleIntroductionResponse(data);
}
function moduleParameterChanged(parameter) {
  handleModuleParameterChange(parameter);
}
function update(_deltaTime) {
  updateIntroduction();
}
