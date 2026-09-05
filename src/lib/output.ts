var controllerOutputReady = false;

function initializeControllerOutput(): void {
  initializePadOutput();
  initializeButtonOutput();
}

function handleControllerOutputParameterChange(
  parameter: ChataigneParameter<unknown>
): void {
  if (parameter.is(local.parameters.general.blackout)
    || parameter.is(local.parameters.general.padBrightness)) {
    if (controllerOutputReady && isControllerOutputConnected()) {
      logGeneralLedOutputChange(parameter);
      sendFullControllerResync();
    }
    return;
  }

  handlePadOutputParameterChange(parameter);
  handleButtonOutputParameterChange(parameter);
}

function isBlackoutActive(): boolean {
  return local.parameters.general.blackout.get();
}

function padBrightnessMultiplier(): number {
  if (local.parameters.general.padBrightness.get() == "dim") return 0.4;
  return 1;
}

function markControllerOutputInitializing(): void {
  controllerOutputReady = false;
}

function completeControllerOutputInitialization(): void {
  if (!isControllerOutputConnected() || controllerOutputReady) return;
  controllerOutputReady = true;
  sendFullControllerResync();
}

function fullResync(): void {
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

function isControllerOutputConnected(): boolean {
  return connectionControl.get() && selectedDevice(1) != "";
}

function sendFullControllerResync(): void {
  sendFullPadResync();
  sendFullButtonResync();
  logFullControllerResyncOutput();
}
