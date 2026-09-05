var padLedEnabledControls: ChataigneParameter<boolean>[] = [];
var padColorModeControls: ChataigneEnumParameter[] = [];
var padColorControls: ChataigneParameter<[number, number, number, number]>[] = [];
var padPaletteModeControls: ChataigneEnumParameter[] = [];

var registerPadControlOperation = 0;
var fullResyncPadControlOperation = 1;
var fullResyncExactMessage: number[] = [];

function initializePadOutput(): void {
  visitPadControls(registerPadControlOperation);
}

function handlePadControl(
  operation: number,
  note: number,
  controls: ChataignePadParameters
): void {
  if (operation == registerPadControlOperation) {
    registerPadOutput(note, controls);
    return;
  }

  if (operation == fullResyncPadControlOperation) {
    appendPadToFullResync(note, controls);
  }
}

function registerPadOutput(note: number, controls: ChataignePadParameters): void {
  padLedEnabledControls[note] = controls.ledEnabled;
  padColorModeControls[note] = controls.colorMode;
  padColorControls[note] = controls.color;
  padPaletteModeControls[note] = controls.paletteMode;
}

function handlePadOutputParameterChange(parameter: ChataigneParameter<unknown>): void {
  if (!controllerOutputReady) return;

  for (var note = sessionPadNoteMinimum; note <= sessionPadNoteMaximum; note += 1) {
    if (parameter.is(padLedEnabledControls[note])) {
      sendPadLedUpdate(note);
      return;
    }

    if (parameter.is(padColorModeControls[note])) {
      if (padLedEnabledControls[note].get()) sendPadLedUpdate(note);
      return;
    }

    if (parameter.is(padColorControls[note])) {
      if (padLedEnabledControls[note].get()) sendPadLedUpdate(note);
      return;
    }

    if (parameter.is(padPaletteModeControls[note])) {
      if (padLedEnabledControls[note].get()
        && padColorModeControls[note].get() == "palette") {
        sendPadLedUpdate(note);
      }
      return;
    }
  }
}

function sendPadLedUpdate(note: number): void {
  var ledEnabled = padLedEnabledControls[note].get();
  if (!padLedOutputEnabled(ledEnabled)) {
    sendHardwarePalettePad(note, 0, "solid100");
    logPadLedOff(note);
    return;
  }

  var requestedRgb = effectivePadColorRgb(padColorControls[note].get());
  if (padColorModeControls[note].get() == "palette") {
    var paletteIndex = nearestHardwarePaletteIndex(requestedRgb);
    var selectedRgb = hardwarePaletteRgb(paletteIndex);
    var paletteMode = padPaletteModeControls[note].get();
    sendHardwarePalettePad(note, paletteIndex, paletteMode);
    logPalettePadLedOutput(
      note,
      paletteIndex,
      selectedRgb,
      requestedRgb,
      hardwarePaletteModeLabel(paletteMode)
    );
    return;
  }

  sendExactRgbPad(note, requestedRgb);
  logPadLedOutput(note, requestedRgb);
}

function sendFullPadResync(): void {
  fullResyncExactMessage = exactRgbMessageHeader(0);
  visitPadControls(fullResyncPadControlOperation);

  var dataLength = fullResyncExactMessage.length - 6;
  if (dataLength > 0) {
    fullResyncExactMessage[4] = (dataLength >> 7) & 0x7f;
    fullResyncExactMessage[5] = dataLength & 0x7f;
    local.sendSysex(fullResyncExactMessage);
  }
}

function appendPadToFullResync(note: number, controls: ChataignePadParameters): void {
  if (!padLedOutputEnabled(controls.ledEnabled.get())) {
    sendHardwarePalettePad(note, 0, "solid100");
    return;
  }

  var requestedRgb = effectivePadColorRgb(controls.color.get());
  if (controls.colorMode.get() == "palette") {
    sendHardwarePalettePad(
      note,
      nearestHardwarePaletteIndex(requestedRgb),
      controls.paletteMode.get()
    );
    return;
  }

  appendExactRgbPadRecord(fullResyncExactMessage, note, requestedRgb);
}

function sendHardwarePalettePad(
  note: number,
  paletteIndex: number,
  paletteMode: string
): void {
  local.sendNoteOn(hardwarePaletteModeChannel(paletteMode), note, paletteIndex);
}

function sendExactRgbPad(note: number, rgb: number[]): void {
  var message = exactRgbMessageHeader(8);
  appendExactRgbPadRecord(message, note, rgb);
  local.sendSysex(message);
}

function exactRgbMessageHeader(dataLength: number): number[] {
  return [
    akaiManufacturerId,
    0x7f,
    apcProductId,
    0x24,
    (dataLength >> 7) & 0x7f,
    dataLength & 0x7f
  ];
}

function appendExactRgbPadRecord(message: number[], note: number, rgb: number[]): void {
  message.push(note, note);
  appendSevenBitPair(message, rgb[0]);
  appendSevenBitPair(message, rgb[1]);
  appendSevenBitPair(message, rgb[2]);
}

function appendSevenBitPair(message: number[], value: number): void {
  message.push((value >> 7) & 0x7f, value & 0x7f);
}

function padLedOutputEnabled(ledEnabled: boolean): boolean {
  return ledEnabled && !isBlackoutActive();
}

function effectivePadColorRgb(color: [number, number, number, number]): number[] {
  return effectiveColorRgb(color, padBrightnessMultiplier());
}

function effectiveColorRgb(
  color: [number, number, number, number],
  brightness: number
): number[] {
  var multiplier = clampNormalized(color[3]) * clampNormalized(brightness);
  return [
    normalizedColorByte(color[0], multiplier),
    normalizedColorByte(color[1], multiplier),
    normalizedColorByte(color[2], multiplier)
  ];
}

function normalizedColorByte(component: number, multiplier: number): number {
  return Math.round(clampNormalized(component) * multiplier * 255);
}

function clampNormalized(value: number): number {
  return Math.max(0, Math.min(1, value));
}
