function init(): void {
  script.enableLog.set(true);
  script.setUpdateRate(20);
  initializeLogging();
  initializePadOutput();
  initializePadMode();
  initializeConnection();
  logCurrentClockState();
}

function noteOnEvent(channel: number, pitch: number, velocity: number): void {
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

function noteOffEvent(channel: number, pitch: number, velocity: number): void {
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

function ccEvent(channel: number, number: number, value: number): void {
  if (channel != sessionMidiChannel
    || number < faderCcMinimum
    || number > faderCcMaximum) {
    logUnrecognizedCcInput(channel, number, value);
    return;
  }
  var faderIndex = number - faderCcMinimum;
  setFaderPosition(faderIndex, value);
  logFaderInput(faderIndex, value);
}

function sysExEvent(data: number[]): void {
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

function moduleParameterChanged(parameter: ChataigneParameter<unknown>): void {
  handleLoggingParameterChange(parameter);
  handlePadOutputParameterChange(parameter);
  handleModuleParameterChange(parameter);
}

function update(_deltaTime: number): void {
  updateIntroduction();
}
