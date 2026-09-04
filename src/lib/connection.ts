var deviceControls: ChataigneMidiDeviceParameter;
var connectionControl: ChataigneParameter<boolean>;
var previousInputDevice = "";
var wrongInputDeviceSelected = false;
var currentDeviceConfigurationWarning = "";
var invalidInitialMidiInputValue = "MIDI Devices to connect to";

// 0 = idle, 1 = waiting for Chataigne's device state to settle,
// 2 = awaiting an Identity Reply, 3 = awaiting an Introduction Response,
// 4 = waiting to retry an all-127 Introduction snapshot.
var introductionState = 0;
var introductionStateChangedAt = 0;
var deviceSettleDelaySeconds = 0.1;
var identityReplyTimeoutSeconds = 0.5;
var introductionRetryDelaySeconds = 0.5;
var ambiguousFaderRetryDelaySeconds = 0.1;
var introductionAttempts = 0;
var maximumIntroductionAttempts = 2;
var identityResult = "not requested";

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
      introductionState = 4;
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

function handleIdentityReply(data: number[]): void {
  var isApc = isApcIdentityReply(data);
  logIdentityReply(data, isApc);
  if (introductionState != 2) return;

  if (!isApc) {
    introductionState = 0;
    script.logWarning(
      "The selected MIDI device returned an Identity Reply, but it is not an APC mini mk2. "
      + "Initialization was blocked."
    );
    return;
  }

  identityResult = "APC mini mk2 reply";
  sendIntroductionAttempt(util.getTime());
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
    && now - introductionStateChangedAt >= identityReplyTimeoutSeconds) {
    identityResult = "no reply after " + Math.round(identityReplyTimeoutSeconds * 1000) + " ms";
    script.logWarning(
      "APC Mini mkII did not respond to Identity Request after "
      + Math.round(identityReplyTimeoutSeconds * 1000)
      + " ms. Continuing with Introduction."
    );
    sendIntroductionAttempt(now);
    return;
  }

  if (introductionState == 3
    && now - introductionStateChangedAt >= introductionRetryDelaySeconds) {
    if (introductionAttempts < maximumIntroductionAttempts) {
      sendIntroductionAttempt(now);
      return;
    }

    introductionState = 0;
    logIntroductionTimeoutWarning();
    completeDeviceInitialization();
    return;
  }

  if (introductionState == 4
    && now - introductionStateChangedAt >= ambiguousFaderRetryDelaySeconds) {
    sendIntroductionAttempt(now);
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
  identityResult = "not requested";
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

  sendIdentityRequestForInitialization(now);
}

function sendIdentityRequestForInitialization(now: number): void {
  // Mark pending before sending: hardware responses may arrive synchronously
  // through Chataigne's MIDI callback path.
  introductionState = 2;
  introductionStateChangedAt = now;
  logIdentityRequest();
  sendIdentityRequest();
}

function sendIntroductionAttempt(now: number): void {
  // The controller may answer synchronously from another MIDI callback. Mark
  // the request pending before sending so a fast response can clear it.
  introductionState = 3;
  introductionStateChangedAt = now;
  introductionAttempts += 1;
  logIntroductionRequest(introductionAttempts);
  sendIntroductionRequest();
}

function logIntroductionTimeoutWarning(): void {
  if (identityResult == "APC mini mk2 reply") {
    script.logWarning(
      "APC Mini mkII identity succeeded, but Introduction did not respond. "
      + "The Notes port or mismatched MIDI input and output ports are probably selected. "
      + "Select APC mini mk2 Control for both MIDI devices. "
      + "Incoming MIDI and LED output will continue, but initial fader positions may be unknown."
    );
    return;
  }

  script.logWarning(
    "The selected MIDI device did not respond to APC Mini mkII Identity or Introduction. "
    + "Verify that APC mini mk2 Control is selected for both MIDI devices. "
    + "Incoming MIDI and LED output will continue, but initial fader positions may be unknown."
  );
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
