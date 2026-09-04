var padLedEnabledControls: ChataigneParameter<boolean>[] = [];
var padColorModeControls: ChataigneEnumParameter[] = [];
var padColorControls: ChataigneParameter<[number, number, number, number]>[] = [];
var padOutputReady = false;

function initializePadOutput(): void {
  registerPadOutput(56, local.parameters.pads.row1.pad11);
  registerPadOutput(57, local.parameters.pads.row1.pad12);
  registerPadOutput(58, local.parameters.pads.row1.pad13);
  registerPadOutput(59, local.parameters.pads.row1.pad14);
  registerPadOutput(60, local.parameters.pads.row1.pad15);
  registerPadOutput(61, local.parameters.pads.row1.pad16);
  registerPadOutput(62, local.parameters.pads.row1.pad17);
  registerPadOutput(63, local.parameters.pads.row1.pad18);
  registerPadOutput(48, local.parameters.pads.row2.pad21);
  registerPadOutput(49, local.parameters.pads.row2.pad22);
  registerPadOutput(50, local.parameters.pads.row2.pad23);
  registerPadOutput(51, local.parameters.pads.row2.pad24);
  registerPadOutput(52, local.parameters.pads.row2.pad25);
  registerPadOutput(53, local.parameters.pads.row2.pad26);
  registerPadOutput(54, local.parameters.pads.row2.pad27);
  registerPadOutput(55, local.parameters.pads.row2.pad28);
  registerPadOutput(40, local.parameters.pads.row3.pad31);
  registerPadOutput(41, local.parameters.pads.row3.pad32);
  registerPadOutput(42, local.parameters.pads.row3.pad33);
  registerPadOutput(43, local.parameters.pads.row3.pad34);
  registerPadOutput(44, local.parameters.pads.row3.pad35);
  registerPadOutput(45, local.parameters.pads.row3.pad36);
  registerPadOutput(46, local.parameters.pads.row3.pad37);
  registerPadOutput(47, local.parameters.pads.row3.pad38);
  registerPadOutput(32, local.parameters.pads.row4.pad41);
  registerPadOutput(33, local.parameters.pads.row4.pad42);
  registerPadOutput(34, local.parameters.pads.row4.pad43);
  registerPadOutput(35, local.parameters.pads.row4.pad44);
  registerPadOutput(36, local.parameters.pads.row4.pad45);
  registerPadOutput(37, local.parameters.pads.row4.pad46);
  registerPadOutput(38, local.parameters.pads.row4.pad47);
  registerPadOutput(39, local.parameters.pads.row4.pad48);
  registerPadOutput(24, local.parameters.pads.row5.pad51);
  registerPadOutput(25, local.parameters.pads.row5.pad52);
  registerPadOutput(26, local.parameters.pads.row5.pad53);
  registerPadOutput(27, local.parameters.pads.row5.pad54);
  registerPadOutput(28, local.parameters.pads.row5.pad55);
  registerPadOutput(29, local.parameters.pads.row5.pad56);
  registerPadOutput(30, local.parameters.pads.row5.pad57);
  registerPadOutput(31, local.parameters.pads.row5.pad58);
  registerPadOutput(16, local.parameters.pads.row6.pad61);
  registerPadOutput(17, local.parameters.pads.row6.pad62);
  registerPadOutput(18, local.parameters.pads.row6.pad63);
  registerPadOutput(19, local.parameters.pads.row6.pad64);
  registerPadOutput(20, local.parameters.pads.row6.pad65);
  registerPadOutput(21, local.parameters.pads.row6.pad66);
  registerPadOutput(22, local.parameters.pads.row6.pad67);
  registerPadOutput(23, local.parameters.pads.row6.pad68);
  registerPadOutput(8, local.parameters.pads.row7.pad71);
  registerPadOutput(9, local.parameters.pads.row7.pad72);
  registerPadOutput(10, local.parameters.pads.row7.pad73);
  registerPadOutput(11, local.parameters.pads.row7.pad74);
  registerPadOutput(12, local.parameters.pads.row7.pad75);
  registerPadOutput(13, local.parameters.pads.row7.pad76);
  registerPadOutput(14, local.parameters.pads.row7.pad77);
  registerPadOutput(15, local.parameters.pads.row7.pad78);
  registerPadOutput(0, local.parameters.pads.row8.pad81);
  registerPadOutput(1, local.parameters.pads.row8.pad82);
  registerPadOutput(2, local.parameters.pads.row8.pad83);
  registerPadOutput(3, local.parameters.pads.row8.pad84);
  registerPadOutput(4, local.parameters.pads.row8.pad85);
  registerPadOutput(5, local.parameters.pads.row8.pad86);
  registerPadOutput(6, local.parameters.pads.row8.pad87);
  registerPadOutput(7, local.parameters.pads.row8.pad88);
}

function registerPadOutput(note: number, controls: ChataignePadParameters): void {
  padLedEnabledControls[note] = controls.ledEnabled;
  padColorModeControls[note] = controls.colorMode;
  padColorControls[note] = controls.color;
}

function handlePadOutputParameterChange(parameter: ChataigneParameter<unknown>): void {
  if (!padOutputReady) return;

  for (var note = sessionPadNoteMinimum; note <= sessionPadNoteMaximum; note += 1) {
    if (parameter.is(padLedEnabledControls[note])
      || parameter.is(padColorModeControls[note])) {
      sendPadLedUpdate(note);
      return;
    }

    if (parameter.is(padColorControls[note])) {
      if (padLedEnabledControls[note].get()
        && padColorModeControls[note].get() == "rgb") {
        sendPadLedUpdate(note);
      }
      return;
    }
  }
}

function markPadOutputInitializing(): void {
  padOutputReady = false;
}

function completePadOutputInitialization(): void {
  if (!isPadOutputConnected()) return;
  if (padOutputReady) return;
  padOutputReady = true;
  sendFullPadResync();
}

function fullResync(): void {
  if (!isPadOutputConnected()) {
    script.logWarning("Full Resync ignored: MIDI device is disconnected.");
    return;
  }
  if (!padOutputReady) {
    script.logWarning("Full Resync ignored: device initialization is still pending.");
    return;
  }
  sendFullPadResync();
}

function isPadOutputConnected(): boolean {
  return connectionControl.get() && selectedDevice(1) != "";
}

function sendPadLedUpdate(note: number): void {
  var rgb = effectivePadRgb(note);
  var message = exactRgbMessageHeader(8);
  appendExactRgbPadRecord(message, note, rgb);
  local.sendSysex(message);
  logPadLedOutput(note, rgb);
}

function sendFullPadResync(): void {
  var message = exactRgbMessageHeader(8 * 64);
  appendPadLedFromControls(message, 56, local.parameters.pads.row1.pad11);
  appendPadLedFromControls(message, 57, local.parameters.pads.row1.pad12);
  appendPadLedFromControls(message, 58, local.parameters.pads.row1.pad13);
  appendPadLedFromControls(message, 59, local.parameters.pads.row1.pad14);
  appendPadLedFromControls(message, 60, local.parameters.pads.row1.pad15);
  appendPadLedFromControls(message, 61, local.parameters.pads.row1.pad16);
  appendPadLedFromControls(message, 62, local.parameters.pads.row1.pad17);
  appendPadLedFromControls(message, 63, local.parameters.pads.row1.pad18);
  appendPadLedFromControls(message, 48, local.parameters.pads.row2.pad21);
  appendPadLedFromControls(message, 49, local.parameters.pads.row2.pad22);
  appendPadLedFromControls(message, 50, local.parameters.pads.row2.pad23);
  appendPadLedFromControls(message, 51, local.parameters.pads.row2.pad24);
  appendPadLedFromControls(message, 52, local.parameters.pads.row2.pad25);
  appendPadLedFromControls(message, 53, local.parameters.pads.row2.pad26);
  appendPadLedFromControls(message, 54, local.parameters.pads.row2.pad27);
  appendPadLedFromControls(message, 55, local.parameters.pads.row2.pad28);
  appendPadLedFromControls(message, 40, local.parameters.pads.row3.pad31);
  appendPadLedFromControls(message, 41, local.parameters.pads.row3.pad32);
  appendPadLedFromControls(message, 42, local.parameters.pads.row3.pad33);
  appendPadLedFromControls(message, 43, local.parameters.pads.row3.pad34);
  appendPadLedFromControls(message, 44, local.parameters.pads.row3.pad35);
  appendPadLedFromControls(message, 45, local.parameters.pads.row3.pad36);
  appendPadLedFromControls(message, 46, local.parameters.pads.row3.pad37);
  appendPadLedFromControls(message, 47, local.parameters.pads.row3.pad38);
  appendPadLedFromControls(message, 32, local.parameters.pads.row4.pad41);
  appendPadLedFromControls(message, 33, local.parameters.pads.row4.pad42);
  appendPadLedFromControls(message, 34, local.parameters.pads.row4.pad43);
  appendPadLedFromControls(message, 35, local.parameters.pads.row4.pad44);
  appendPadLedFromControls(message, 36, local.parameters.pads.row4.pad45);
  appendPadLedFromControls(message, 37, local.parameters.pads.row4.pad46);
  appendPadLedFromControls(message, 38, local.parameters.pads.row4.pad47);
  appendPadLedFromControls(message, 39, local.parameters.pads.row4.pad48);
  appendPadLedFromControls(message, 24, local.parameters.pads.row5.pad51);
  appendPadLedFromControls(message, 25, local.parameters.pads.row5.pad52);
  appendPadLedFromControls(message, 26, local.parameters.pads.row5.pad53);
  appendPadLedFromControls(message, 27, local.parameters.pads.row5.pad54);
  appendPadLedFromControls(message, 28, local.parameters.pads.row5.pad55);
  appendPadLedFromControls(message, 29, local.parameters.pads.row5.pad56);
  appendPadLedFromControls(message, 30, local.parameters.pads.row5.pad57);
  appendPadLedFromControls(message, 31, local.parameters.pads.row5.pad58);
  appendPadLedFromControls(message, 16, local.parameters.pads.row6.pad61);
  appendPadLedFromControls(message, 17, local.parameters.pads.row6.pad62);
  appendPadLedFromControls(message, 18, local.parameters.pads.row6.pad63);
  appendPadLedFromControls(message, 19, local.parameters.pads.row6.pad64);
  appendPadLedFromControls(message, 20, local.parameters.pads.row6.pad65);
  appendPadLedFromControls(message, 21, local.parameters.pads.row6.pad66);
  appendPadLedFromControls(message, 22, local.parameters.pads.row6.pad67);
  appendPadLedFromControls(message, 23, local.parameters.pads.row6.pad68);
  appendPadLedFromControls(message, 8, local.parameters.pads.row7.pad71);
  appendPadLedFromControls(message, 9, local.parameters.pads.row7.pad72);
  appendPadLedFromControls(message, 10, local.parameters.pads.row7.pad73);
  appendPadLedFromControls(message, 11, local.parameters.pads.row7.pad74);
  appendPadLedFromControls(message, 12, local.parameters.pads.row7.pad75);
  appendPadLedFromControls(message, 13, local.parameters.pads.row7.pad76);
  appendPadLedFromControls(message, 14, local.parameters.pads.row7.pad77);
  appendPadLedFromControls(message, 15, local.parameters.pads.row7.pad78);
  appendPadLedFromControls(message, 0, local.parameters.pads.row8.pad81);
  appendPadLedFromControls(message, 1, local.parameters.pads.row8.pad82);
  appendPadLedFromControls(message, 2, local.parameters.pads.row8.pad83);
  appendPadLedFromControls(message, 3, local.parameters.pads.row8.pad84);
  appendPadLedFromControls(message, 4, local.parameters.pads.row8.pad85);
  appendPadLedFromControls(message, 5, local.parameters.pads.row8.pad86);
  appendPadLedFromControls(message, 6, local.parameters.pads.row8.pad87);
  appendPadLedFromControls(message, 7, local.parameters.pads.row8.pad88);
  local.sendSysex(message);
  logFullPadResyncOutput();
}

function appendPadLedFromControls(
  message: number[],
  note: number,
  controls: ChataignePadParameters
): void {
  appendExactRgbPadRecord(message, note, effectivePadRgbFromControls(controls));
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

function effectivePadRgb(note: number): number[] {
  return effectiveRgbValues(
    padLedEnabledControls[note].get(),
    padColorModeControls[note].get(),
    padColorControls[note].get()
  );
}

function effectivePadRgbFromControls(controls: ChataignePadParameters): number[] {
  return effectiveRgbValues(
    controls.ledEnabled.get(),
    controls.colorMode.get(),
    controls.color.get()
  );
}

function effectiveRgbValues(
  ledEnabled: boolean,
  colorMode: string,
  color: [number, number, number, number]
): number[] {
  if (!ledEnabled || colorMode != "rgb") {
    return [0, 0, 0];
  }

  var alpha = clampNormalized(color[3]);
  return [
    normalizedColorByte(color[0], alpha),
    normalizedColorByte(color[1], alpha),
    normalizedColorByte(color[2], alpha)
  ];
}

function normalizedColorByte(component: number, alpha: number): number {
  return Math.round(clampNormalized(component) * alpha * 255);
}

function clampNormalized(value: number): number {
  return Math.max(0, Math.min(1, value));
}
