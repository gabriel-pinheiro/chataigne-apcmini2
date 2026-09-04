// Palette indexes from Akai's APC Mini mkII communication protocol v1.0.
var hardwarePaletteColors = [
  0x000000, 0x1e1e1e, 0x7f7f7f, 0xffffff, 0xff4c4c, 0xff0000, 0x590000, 0x190000,
  0xffbd6c, 0xff5400, 0x591d00, 0x271b00, 0xffff4c, 0xffff00, 0x595900, 0x191900,
  0x88ff4c, 0x54ff00, 0x1d5900, 0x142b00, 0x4cff4c, 0x00ff00, 0x005900, 0x001900,
  0x4cff5e, 0x00ff19, 0x00590d, 0x001902, 0x4cff88, 0x00ff55, 0x00591d, 0x001f12,
  0x4cffb7, 0x00ff99, 0x005935, 0x001912, 0x4cc3ff, 0x00a9ff, 0x004152, 0x001019,
  0x4c88ff, 0x0055ff, 0x001d59, 0x000819, 0x4c4cff, 0x0000ff, 0x000059, 0x000019,
  0x874cff, 0x5400ff, 0x190064, 0x0f0030, 0xff4cff, 0xff00ff, 0x590059, 0x190019,
  0xff4c87, 0xff0054, 0x59001d, 0x220013, 0xff1500, 0x993500, 0x795100, 0x436400,
  0x033900, 0x005735, 0x00547f, 0x0000ff, 0x00454f, 0x2500cc, 0x7f7f7f, 0x202020,
  0xff0000, 0xbdff2d, 0xafed06, 0x64ff09, 0x108b00, 0x00ff87, 0x00a9ff, 0x002aff,
  0x3f00ff, 0x7a00ff, 0xb21a7d, 0x402100, 0xff4a00, 0x88e106, 0x72ff15, 0x00ff00,
  0x3bff26, 0x59ff71, 0x38ffcc, 0x5b8aff, 0x3151c6, 0x877fe9, 0xd31dff, 0xff005d,
  0xff7f00, 0xb9b000, 0x90ff00, 0x835d07, 0x392b00, 0x144c10, 0x0d5038, 0x15152a,
  0x16205a, 0x693c1c, 0xa8000a, 0xde513d, 0xd86a1c, 0xffe126, 0x9ee12f, 0x67b50f,
  0x1e1e30, 0xdcff6b, 0x80ffbd, 0x9a99ff, 0x8e66ff, 0x404040, 0x757575, 0xe0ffff,
  0xa00000, 0x350000, 0x1ad000, 0x074200, 0xb9b000, 0x3f3100, 0xb35f00, 0x4b1502
];

function nearestHardwarePaletteIndex(rgb: number[]): number {
  var closestIndex = 0;
  var closestDistance = -1;

  for (var index = 0; index < hardwarePaletteColors.length; index += 1) {
    var paletteRgb = hardwarePaletteRgb(index);
    var redDifference = rgb[0] - paletteRgb[0];
    var greenDifference = rgb[1] - paletteRgb[1];
    var blueDifference = rgb[2] - paletteRgb[2];
    var distance = redDifference * redDifference
      + greenDifference * greenDifference
      + blueDifference * blueDifference;

    // Keeping the first equal match gives duplicate colors a stable, lowest index.
    if (closestDistance < 0 || distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}

function hardwarePaletteRgb(index: number): number[] {
  var color = hardwarePaletteColors[index];
  return [
    Math.floor(color / 65536) % 256,
    Math.floor(color / 256) % 256,
    color % 256
  ];
}

function hardwarePaletteModeChannel(mode: string): number {
  if (mode == "solid10") return 1;
  if (mode == "solid25") return 2;
  if (mode == "solid50") return 3;
  if (mode == "solid65") return 4;
  if (mode == "solid75") return 5;
  if (mode == "solid90") return 6;
  if (mode == "pulse16") return 8;
  if (mode == "pulse8") return 9;
  if (mode == "pulse4") return 10;
  if (mode == "pulse2") return 11;
  if (mode == "blink24") return 12;
  if (mode == "blink16") return 13;
  if (mode == "blink8") return 14;
  if (mode == "blink4") return 15;
  if (mode == "blink2") return 16;
  return 7;
}

function hardwarePaletteModeLabel(mode: string): string {
  if (mode == "solid10") return "Solid - 10%";
  if (mode == "solid25") return "Solid - 25%";
  if (mode == "solid50") return "Solid - 50%";
  if (mode == "solid65") return "Solid - 65%";
  if (mode == "solid75") return "Solid - 75%";
  if (mode == "solid90") return "Solid - 90%";
  if (mode == "pulse16") return "Pulse - 1/16";
  if (mode == "pulse8") return "Pulse - 1/8";
  if (mode == "pulse4") return "Pulse - 1/4";
  if (mode == "pulse2") return "Pulse - 1/2";
  if (mode == "blink24") return "Blink - 1/24";
  if (mode == "blink16") return "Blink - 1/16";
  if (mode == "blink8") return "Blink - 1/8";
  if (mode == "blink4") return "Blink - 1/4";
  if (mode == "blink2") return "Blink - 1/2";
  return "Solid - 100%";
}
