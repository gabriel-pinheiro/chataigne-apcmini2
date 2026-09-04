// Keep full-resync reads on static native paths, matching the proven pad
// traversal workaround for Chataigne 1.10.
function visitButtonLedControls(operation: number): void {
  handleButtonLedControl(operation, 100, local.parameters.buttons.trackButtons.track1.ledMode);
  handleButtonLedControl(operation, 101, local.parameters.buttons.trackButtons.track2.ledMode);
  handleButtonLedControl(operation, 102, local.parameters.buttons.trackButtons.track3.ledMode);
  handleButtonLedControl(operation, 103, local.parameters.buttons.trackButtons.track4.ledMode);
  handleButtonLedControl(operation, 104, local.parameters.buttons.trackButtons.track5.ledMode);
  handleButtonLedControl(operation, 105, local.parameters.buttons.trackButtons.track6.ledMode);
  handleButtonLedControl(operation, 106, local.parameters.buttons.trackButtons.track7.ledMode);
  handleButtonLedControl(operation, 107, local.parameters.buttons.trackButtons.track8.ledMode);
  handleButtonLedControl(operation, 112, local.parameters.buttons.sceneButtons.scene1.ledMode);
  handleButtonLedControl(operation, 113, local.parameters.buttons.sceneButtons.scene2.ledMode);
  handleButtonLedControl(operation, 114, local.parameters.buttons.sceneButtons.scene3.ledMode);
  handleButtonLedControl(operation, 115, local.parameters.buttons.sceneButtons.scene4.ledMode);
  handleButtonLedControl(operation, 116, local.parameters.buttons.sceneButtons.scene5.ledMode);
  handleButtonLedControl(operation, 117, local.parameters.buttons.sceneButtons.scene6.ledMode);
  handleButtonLedControl(operation, 118, local.parameters.buttons.sceneButtons.scene7.ledMode);
  handleButtonLedControl(operation, 119, local.parameters.buttons.sceneButtons.scene8.ledMode);
}
