var deviceControls: ChataigneMidiDeviceParameter;
var connectionControl: ChataigneParameter<boolean>;
var previousInputDevice = "";
var wrongInputDeviceSelected = false;
var wrongDeviceWarningShown = false;

// 0 = idle, 1 = scheduled after a device change, 2 = awaiting response.
var introductionState = 0;
var introductionStateChangedAt = 0;
var introductionDelaySeconds = 0.1;
var introductionTimeoutSeconds = 1;
var introductionAttempts = 0;
var maximumIntroductionAttempts = 2;

function initializeConnection(): void {
  deviceControls = local.parameters.devices;
  connectionControl = local.parameters.isConnected;
  previousInputDevice = selectedDevice(0);

  resetPressedValues();
  validateSelectedDevices();
  scheduleIntroduction();
}

function handleIntroductionResponse(data: number[]): void {
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
      "APC Mini mkII returned 127 for every fader during initialization. "
      + "Keeping the last known positions until the faders are moved."
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

function handleModuleParameterChange(parameter: ChataigneParameter<unknown>): void {
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

function updateIntroduction(): void {
  if (introductionState == 0) return;

  var now = util.getTime();
  if (introductionState == 1
    && now - introductionStateChangedAt >= introductionDelaySeconds) {
    // The controller may answer synchronously from another MIDI callback. Mark
    // the request pending before sending so a fast response can clear it.
    introductionState = 2;
    introductionStateChangedAt = now;
    introductionAttempts += 1;
    logInitializationRequest(introductionAttempts);
    sendIntroductionRequest();
    return;
  }

  if (introductionState == 2
    && now - introductionStateChangedAt >= introductionTimeoutSeconds) {
    introductionState = 0;
    script.logWarning(
      "APC Mini mkII did not respond to initialization. "
      + "Incoming MIDI will continue, but initial fader positions may be unknown."
    );
    completePadOutputInitialization();
  }
}

function handleDeviceChange(): void {
  var inputDevice = selectedDevice(0);

  if (inputDevice != previousInputDevice) {
    resetPressedValues();
    setPadMode("unknown");
  }

  previousInputDevice = inputDevice;
  validateSelectedDevices();
  scheduleIntroduction();
}

function scheduleIntroduction(): void {
  markPadOutputInitializing();
  if (!connectionControl.get()
    || selectedDevice(0) == ""
    || selectedDevice(1) == "") {
    introductionState = 0;
    return;
  }
  introductionAttempts = 0;
  introductionState = 1;
  introductionStateChangedAt = util.getTime();
}

function isAmbiguousFaderSnapshot(values: number[]): boolean {
  if (values.length != 9) return false;
  for (var index = 0; index < values.length; index += 1) {
    if (values[index] != 127) return false;
  }
  return true;
}

function selectedDevice(index: number): string {
  var devices = deviceControls.get();
  if (!devices || devices.length <= index || !devices[index]) return "";
  return devices[index];
}

function validateSelectedDevices(): void {
  wrongInputDeviceSelected = isNotesDevice(selectedDevice(0));
  var wrongDeviceSelected = wrongInputDeviceSelected || isNotesDevice(selectedDevice(1));

  if (wrongDeviceSelected && !wrongDeviceWarningShown) {
    wrongDeviceWarningShown = true;
    script.logWarning(
      "Select APC mini mk2 Control for both MIDI input and output. "
      + "The separate Notes port is not supported."
    );
  } else if (!wrongDeviceSelected) {
    wrongDeviceWarningShown = false;
  }
}

function isNotesDevice(identifier: string): boolean {
  var normalized = identifier.toLowerCase();
  return normalized.indexOf("apc") >= 0 && normalized.indexOf("notes") >= 0;
}

function sameControl(
  first: ChataigneParameter<unknown>,
  second: ChataigneParameter<unknown>
): boolean {
  return first.is(second);
}
