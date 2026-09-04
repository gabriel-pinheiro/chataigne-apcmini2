var padModeControl: ChataigneEnumParameter;
var currentPadMode: PadMode = "unknown";

function initializePadMode(): void {
  padModeControl = local.values.status.padMode;
  currentPadMode = "unknown";
  padModeControl.setData(currentPadMode);
}

function isDrumPadMessage(channel: number, pitch: number): boolean {
  return channel == drumMidiChannel
    && pitch >= drumPadNoteMinimum
    && pitch <= drumPadNoteMaximum;
}

function setPadMode(mode: PadMode): void {
  if (currentPadMode == mode) return;
  currentPadMode = mode;
  padModeControl.setData(mode);

  if (mode == "drum") {
    script.logWarning(
      "Drum Mode is not supported. Press Shift + Scene 6 to return to Session Mode."
    );
  } else if (mode == "note") {
    script.logWarning(
      "Note Mode is not supported. Press Shift + Scene 7 to return to Session Mode."
    );
  } else if (mode == "node_edit") {
    script.logWarning(
      "Note Edit Mode is not supported. Press Shift + Scene 7 to return to Session Mode."
    );
  }
}
