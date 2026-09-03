function init(): void {
  script.enableLog.set(true);
  script.setUpdateRate(20);
  initializePadMode();
  initializeConnection();
}

function noteOnEvent(channel: number, pitch: number, velocity: number): void {
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

function noteOffEvent(channel: number, pitch: number, _velocity: number): void {
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

function ccEvent(channel: number, number: number, value: number): void {
  if (channel != sessionMidiChannel) return;
  if (number < faderCcMinimum || number > faderCcMaximum) return;
  setFaderPosition(number - faderCcMinimum, value);
}

function sysExEvent(data: number[]): void {
  var mode = decodePadMode(data);
  if (mode != "") {
    setPadMode(mode);
    return;
  }

  handleIntroductionResponse(data);
}

function moduleParameterChanged(parameter: ChataigneParameter<unknown>): void {
  handleModuleParameterChange(parameter);
}

function update(_deltaTime: number): void {
  updateIntroduction();
}
