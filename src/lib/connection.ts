var deviceControls: ChataigneMidiDeviceParameter;
var connectionControl: ChataigneParameter<boolean>;
var previousInputDevice = "";
var wrongInputDeviceSelected = false;
var currentDeviceConfigurationWarning = "";
var invalidInitialMidiInputValue = "MIDI Devices to connect to";

// 0 = idle, 1 = waiting for Chataigne's device state to settle,
// 2 = awaiting an Introduction response.
var introductionState = 0;
var introductionStateChangedAt = 0;
var deviceSettleDelaySeconds = 0.1;
var introductionRetryDelaySeconds = 0.5;
var introductionAttempts = 0;
var maximumIntroductionAttempts = 2;

function initializeConnection(): void {
  deviceControls = local.parameters.devices;
  connectionControl = local.parameters.isConnected;
  previousInputDevice = selectedDevice(0);

  resetPressedValues();
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

function handleModuleParameterChange(parameter: ChataigneParameter<unknown>): void {
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

function updateIntroduction(): void {
  if (introductionState == 0) return;

  var now = util.getTime();
  if (introductionState == 1
    && now - introductionStateChangedAt >= deviceSettleDelaySeconds) {
    beginIntroductionAfterDeviceSettle(now);
    return;
  }

  if (introductionState == 2
    && now - introductionStateChangedAt >= introductionRetryDelaySeconds) {
    if (introductionAttempts < maximumIntroductionAttempts) {
      sendIntroductionAttempt(now);
      return;
    }

    introductionState = 0;
    script.logWarning(
      "APC Mini mkII did not respond to initialization. "
      + "Verify that APC mini mk2 Control (not Notes) is selected for both MIDI devices. "
      + "Incoming MIDI will continue, but initial fader positions may be unknown."
    );
    completeDeviceInitialization();
  }
}

function handleDeviceChange(): void {
  var inputDevice = selectedDevice(0);

  if (inputDevice != previousInputDevice) {
    resetPressedValues();
    setPadMode("unknown");
  }

  previousInputDevice = inputDevice;
  scheduleIntroduction();
}

function scheduleIntroduction(): void {
  markControllerOutputInitializing();
  markMidiClockInitializing();
  introductionAttempts = 0;
  introductionState = 1;
  introductionStateChangedAt = util.getTime();
}

function beginIntroductionAfterDeviceSettle(now: number): void {
  var inputDevice = selectedDevice(0);
  var outputDevice = selectedDevice(1);
  if (!validateSelectedDevices(inputDevice, outputDevice)
    || !connectionControl.get()
    || inputDevice == ""
    || outputDevice == "") {
    introductionState = 0;
    return;
  }

  sendIntroductionAttempt(now);
}

function sendIntroductionAttempt(now: number): void {
  // The controller may answer synchronously from another MIDI callback. Mark
  // the request pending before sending so a fast response can clear it.
  introductionState = 2;
  introductionStateChangedAt = now;
  introductionAttempts += 1;
  logInitializationRequest(introductionAttempts);
  sendIntroductionRequest();
}

function completeDeviceInitialization(): void {
  completeControllerOutputInitialization();
  completeMidiClockInitialization();
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
  var device = "" + devices[index];
  if (index == 0 && device == invalidInitialMidiInputValue) return "";
  return device;
}

function validateSelectedDevices(
  inputDevice: string,
  outputDevice: string
): boolean {
  // Some platforms include a descriptive name in the raw ID. Chataigne does
  // not expose the selected display names reliably to scripts, so this check
  // is intentionally opportunistic.
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

function setDeviceConfigurationWarning(problem: string): void {
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
      "The APC mini mk2 Notes port is not supported. "
      + "Select APC mini mk2 Control for both MIDI input and output."
    );
  }
}

function isNotesDevice(name: string): boolean {
  return name.toLowerCase().indexOf("notes") >= 0;
}

function sameControl(
  first: ChataigneParameter<unknown>,
  second: ChataigneParameter<unknown>
): boolean {
  return first.is(second);
}
