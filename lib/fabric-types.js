// Modern Fabric.js configuration and types
// This file provides configuration for Fabric.js

export const DEFAULT_CANVAS_CONFIG = {
  width: 750,
  height: 1000,
  backgroundColor: '#ffffff',
  selection: true,
  preserveObjectStacking: true,
  allowTouchScrolling: true,
  fireRightClick: true,
  stopContextMenu: false,
  renderOnAddRemove: true, // Auto-render when objects are added/removed
  skipOffscreen: false, // Ensure all objects render even if off-screen
  enableRetinaScaling: true, // Better rendering on high-DPI displays
};

export const DEFAULT_OBJECT_CONTROLS = {
  borderColor: '#10b981', // Green color to match hover effect
  borderWidth: 3, // Thick border like hover effect
  borderDashArray: [5, 5], // Dotted pattern like hover effect
  cornerColor: '#10b981', // Green corners to match hover effect
  cornerStrokeColor: '#10b981',
  cornerStyle: 'circle',
  cornerSize: 12, // Slightly smaller corners
  transparentCorners: false,
  borderScaleFactor: 2, // Thinner border scale
  lockRotation: true,
  hasRotatingPoint: false,
  originX: 'left',
  originY: 'top',
  padding: 2,
  centeredScaling: false,
  centeredRotation: false,
};

export const DEFAULT_KEYBOARD_SHORTCUTS = {
  selectAll: 'ctrl+a',
  duplicate: 'ctrl+d',
  undo: 'ctrl+z',
  redo: 'ctrl+y',
  delete: 'delete',
  editText: 'f2',
  escape: 'escape',
  enter: 'enter',
};

