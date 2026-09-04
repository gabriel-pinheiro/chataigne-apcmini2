var moduleClockControls: ChataigneClockControls;
var midiClockControls: ChataigneClockControls;
var midiClockInitialized = false;
var midiClockReady = false;

function initializeClock(): void {
  moduleClockControls = local.parameters.clock;
  midiClockControls = local.values.tempo;

  // The module-owned parameters are the public clock controls. Keep the
  // inherited MIDI values visible for diagnostics but prevent conflicting UI
  // edits there.
  midiClockControls.sendClock.setAttribute("readOnly", true);
  midiClockControls.bpm.setAttribute("readOnly", true);
  midiClockInitialized = true;
  midiClockReady = false;
  midiClockControls.sendClock.set(false);
  midiClockControls.bpm.set(moduleClockControls.bpm.get());
}

function handleClockParameterChange(
  parameter: ChataigneParameter<unknown>
): void {
  if (parameter.is(moduleClockControls.sendClock)
    || parameter.is(moduleClockControls.bpm)) {
    synchronizeMidiClock();
  }
}

function synchronizeMidiClock(): void {
  if (!midiClockInitialized) return;
  midiClockControls.bpm.set(moduleClockControls.bpm.get());
  if (midiClockReady) {
    midiClockControls.sendClock.set(moduleClockControls.sendClock.get());
  } else if (midiClockControls.sendClock.get()) {
    midiClockControls.sendClock.set(false);
  }
}

function markMidiClockInitializing(): void {
  if (!midiClockInitialized) return;
  midiClockReady = false;
  if (midiClockControls.sendClock.get()) {
    midiClockControls.sendClock.set(false);
  }
}

function completeMidiClockInitialization(): void {
  if (!midiClockInitialized || midiClockReady) return;
  midiClockReady = true;

  // A saved project can restore the inherited value as true without starting
  // Chataigne's native MIDIClockSender. BPM is applied before a real transition
  // to true, after the output has answered initialization (or timed out).
  if (midiClockControls.sendClock.get()) {
    midiClockControls.sendClock.set(false);
  }
  midiClockControls.bpm.set(moduleClockControls.bpm.get());
  midiClockControls.sendClock.set(moduleClockControls.sendClock.get());
}
