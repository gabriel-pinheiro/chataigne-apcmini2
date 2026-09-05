var buttonLedModeControls: ChataigneEnumParameter[] = [];
var registerButtonLedOperation = 0;
var resyncButtonLedOperation = 1;
var peripheralLedMidiChannel = 1;

function initializeButtonOutput(): void {
  visitButtonLedControls(registerButtonLedOperation);
}

function handleButtonLedControl(
  operation: number,
  note: number,
  control: ChataigneEnumParameter
): void {
  if (operation == registerButtonLedOperation) {
    buttonLedModeControls[note] = control;
    return;
  }

  if (operation == resyncButtonLedOperation) {
    sendButtonLed(note, control.get());
  }
}

function handleButtonOutputParameterChange(
  parameter: ChataigneParameter<unknown>
): void {
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

function sendButtonLedUpdate(note: number): void {
  var mode = buttonLedModeControls[note].get();
  sendButtonLed(note, mode);
  logButtonLedOutput(note, buttonLedModeLabel(effectiveButtonLedMode(mode)));
}

function sendFullButtonResync(): void {
  visitButtonLedControls(resyncButtonLedOperation);
}

function sendButtonLed(note: number, mode: string): void {
  local.sendNoteOn(
    peripheralLedMidiChannel,
    note,
    buttonLedModeVelocity(effectiveButtonLedMode(mode))
  );
}

function effectiveButtonLedMode(mode: string): string {
  if (isBlackoutActive()) return "off";
  return mode;
}

function buttonLedModeVelocity(mode: string): number {
  if (mode == "on") return 1;
  if (mode == "blink") return 2;
  return 0;
}

function buttonLedModeLabel(mode: string): string {
  if (mode == "on") return "On";
  if (mode == "blink") return "Blink";
  return "Off";
}
