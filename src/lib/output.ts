var controllerOutputReady = false;

function initializeControllerOutput(): void {
  initializePadOutput();
  initializeButtonOutput();
}

function handleControllerOutputParameterChange(
  parameter: ChataigneParameter<unknown>
): void {
  handlePadOutputParameterChange(parameter);
  handleButtonOutputParameterChange(parameter);
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
