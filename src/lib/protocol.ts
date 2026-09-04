type PadMode = "unknown" | "session" | "note" | "drum" | "node_edit";

// Intentionally use loose numeric equality in runtime code. JUCE parses script
// integer literals as int64, while Chataigne supplies MIDI values as int vars;
// its strict equality operator treats those numeric storage types as unequal.

var sessionMidiChannel = 1;
var drumMidiChannel = 10;
var sessionPadNoteMinimum = 0;
var sessionPadNoteMaximum = 63;
var drumPadNoteMinimum = 64;
var drumPadNoteMaximum = 127;
var trackButtonNoteMinimum = 100;
var trackButtonNoteMaximum = 107;
var sceneButtonNoteMinimum = 112;
var sceneButtonNoteMaximum = 119;
var shiftButtonNote = 122;
var faderCcMinimum = 48;
var faderCcMaximum = 56;

var akaiManufacturerId = 0x47;
var apcProductId = 0x4f;
var universalNonRealtimeId = 0x7e;
var identityMessageId = 0x06;
var identityRequestId = 0x01;
var identityReplyId = 0x02;
var introductionRequestId = 0x60;
var introductionResponseId = 0x61;
var padModeMessageId = 0x62;

function isApcSysex(data: number[], messageId: number): boolean {
  return data.length >= 4
    && data[0] == akaiManufacturerId
    && data[1] == 0x7f
    && data[2] == apcProductId
    && data[3] == messageId;
}

function isIdentityReply(data: number[]): boolean {
  return data.length >= 4
    && data[0] == universalNonRealtimeId
    && data[2] == identityMessageId
    && data[3] == identityReplyId;
}

function isApcIdentityReply(data: number[]): boolean {
  return isIdentityReply(data)
    && data.length >= 6
    && data[4] == akaiManufacturerId
    && data[5] == apcProductId;
}

function decodePadMode(data: number[]): PadMode | "" {
  if (!isApcSysex(data, padModeMessageId) || data.length < 7) return "";

  var mode = data[6];
  if (mode == 0) return "session";
  if (mode == 1) return "note";
  if (mode == 2) return "drum";
  if (mode == 3) return "node_edit";
  return "";
}

function decodeIntroductionFaders(data: number[]): number[] {
  if (!isApcSysex(data, introductionResponseId) || data.length < 15) return [];

  var values: number[] = [];
  for (var index = 0; index < 9; index += 1) {
    var value = data[index + 6];
    if (value < 0 || value > 127) return [];
    values.push(value);
  }
  return values;
}

function sendIntroductionRequest(): void {
  // Application/configuration 0, module version 0.1.0.
  local.sendSysex(
    akaiManufacturerId,
    0x7f,
    apcProductId,
    introductionRequestId,
    0x00,
    0x04,
    0x00,
    0x00,
    0x01,
    0x00
  );
}

function sendIdentityRequest(): void {
  // Chataigne/JUCE adds the framing F0 and F7 bytes.
  local.sendSysex(
    universalNonRealtimeId,
    0x00,
    identityMessageId,
    identityRequestId
  );
}

function normalizeMidiValue(value: number): number {
  return Math.max(0, Math.min(127, value)) / 127;
}
