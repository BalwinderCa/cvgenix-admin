// Modern Fabric.js utilities and best practices
// This file contains utility functions for working with Fabric.js

import { 
  DEFAULT_CANVAS_CONFIG,
  DEFAULT_OBJECT_CONTROLS,
  DEFAULT_KEYBOARD_SHORTCUTS
} from './fabric-types';

export class FabricCanvasManager {
  constructor(
    canvasElement,
    config = DEFAULT_CANVAS_CONFIG,
    objectControls = DEFAULT_OBJECT_CONTROLS,
    eventHandlers = {},
    keyboardShortcuts = DEFAULT_KEYBOARD_SHORTCUTS
  ) {
    this.canvasElement = canvasElement;
    this.config = config;
    this.objectControls = objectControls;
    this.eventHandlers = eventHandlers;
    this.keyboardShortcuts = keyboardShortcuts;
    this.canvas = null;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
    this.isRestoring = false;
    this.shouldRecord = true;
    this.isUserAction = false;
    this.saveStateTimeout = null;
    this.cleanupFunctions = [];
    this.selectionStartState = null; // Track selection state to prevent saving on just selection
    this.isDragging = false; // Track if object is being dragged
    this.isScaling = false; // Track if object is being scaled
    this.templateLoaded = false; // Track if template has been loaded
  }

  async initialize() {
    if (this.canvas) {
      return this.canvas;
    }

    const fabric = await this.loadFabric();
    
    this.canvas = new fabric.Canvas(this.canvasElement, {
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.config.backgroundColor,
      selection: this.config.selection,
      preserveObjectStacking: this.config.preserveObjectStacking,
      allowTouchScrolling: this.config.allowTouchScrolling,
      fireRightClick: this.config.fireRightClick,
      stopContextMenu: this.config.stopContextMenu,
      renderOnAddRemove: this.config.renderOnAddRemove !== false, // Auto-render on changes
      skipOffscreen: this.config.skipOffscreen === true, // Don't skip offscreen by default
      enableRetinaScaling: this.config.enableRetinaScaling !== false, // High-DPI rendering
    });
    
    console.log('✅ Canvas initialized with renderOnAddRemove:', this.canvas.renderOnAddRemove);

    this.setupHighDPICanvas();
    this.setupObjectControls(fabric);
    this.setupEventHandlers();
    this.setupKeyboardShortcuts();
    this.setupUndoRedo();
    this.setupResizeHandler();
    // Don't save initial empty state - wait for template to load
    // this.saveState();
    
    // Add object count monitoring after template loads
    this.canvas.addEventListener = this.canvas.on.bind(this.canvas);
    
    // Monitor all object removals (keep minimal logging)
    // Monitor canvas.clear()
    const originalClear = this.canvas.clear.bind(this.canvas);
    this.canvas.clear = () => {
      const stack = new Error().stack;
      console.warn('⚠️ canvas.clear() called!');
      console.warn('   Stack:', stack);
      return originalClear();
    };
    
    // Monitor canvas.remove() to track object removal
    const originalRemove = this.canvas.remove.bind(this.canvas);
    this.canvas.remove = (...args) => {
      const objectsToRemove = args;
      console.log(`🗑️ canvas.remove() called - Removing ${objectsToRemove.length} object(s), Current total: ${this.canvas.getObjects().length}`);
      return originalRemove(...args);
    };
    
    // Monitor renderAll() to debug rendering issues
    const originalRenderAll = this.canvas.renderAll.bind(this.canvas);
    this.canvas.renderAll = () => {
      const objects = this.canvas.getObjects();
      const objectCount = objects.length;
      
      // Get stack trace to see who's calling renderAll
      const stack = new Error().stack;
      const callerLine = stack.split('\n')[2]; // Get the caller
      
      console.log(`🎨 renderAll() called - Objects: ${objectCount}`);
      console.log(`   Called from: ${callerLine}`);
      
      if (objectCount === 0) {
        console.error('❌ CRITICAL: renderAll() called with ZERO objects!');
        console.error('   Full stack:', stack);
      }
      
      try {
        const result = originalRenderAll();
        return result;
      } catch (error) {
        console.error('❌ Error in renderAll():', error);
        throw error;
      }
    };
    
    // Monitor requestRenderAll()
    const originalRequestRenderAll = this.canvas.requestRenderAll.bind(this.canvas);
    this.canvas.requestRenderAll = () => {
      return originalRequestRenderAll();
    };

    return this.canvas;
  }

  async loadFabric() {
    if (typeof window === 'undefined') {
      throw new Error('Fabric.js can only be loaded in browser environment');
    }

    if (window.fabric) {
      return window.fabric;
    }

    const { loadFabric } = await import('@/lib/fabric-loader');
    return await loadFabric();
  }

  setupHighDPICanvas() {
    if (!this.canvas || !this.canvasElement) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvas = this.canvasElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = this.config.width * devicePixelRatio;
    canvas.height = this.config.height * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    canvas.style.width = this.config.width + 'px';
    canvas.style.height = this.config.height + 'px';

    this.canvas.setDimensions({
      width: this.config.width,
      height: this.config.height
    });
  }

  setupResizeHandler() {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (this.canvas && this.canvasElement) {
        this.setupHighDPICanvas();
        this.canvas.requestRenderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    this.cleanupFunctions.push(() => {
      window.removeEventListener('resize', handleResize);
    });
  }

  setupObjectControls(fabric) {
    if (!this.canvas) return;

    fabric.Object.prototype.set({
      borderColor: this.objectControls.borderColor,
      borderWidth: this.objectControls.borderWidth,
      borderDashArray: this.objectControls.borderDashArray,
      cornerColor: this.objectControls.cornerColor,
      cornerStrokeColor: this.objectControls.cornerStrokeColor,
      cornerStyle: this.objectControls.cornerStyle,
      cornerSize: this.objectControls.cornerSize,
      transparentCorners: this.objectControls.transparentCorners,
      borderScaleFactor: this.objectControls.borderScaleFactor,
      lockRotation: this.objectControls.lockRotation,
      hasRotatingPoint: this.objectControls.hasRotatingPoint,
      originX: this.objectControls.originX,
      originY: this.objectControls.originY,
      padding: this.objectControls.padding,
      centeredScaling: this.objectControls.centeredScaling,
      centeredRotation: this.objectControls.centeredRotation,
    });

    fabric.Object.prototype.setControlsVisibility({
      mt: false, mb: false, mtr: false,
      ml: true, mr: true,
      tl: true, tr: true, bl: true, br: true
    });
  }

  setupEventHandlers() {
    if (!this.canvas) return;

    this.canvas.on('object:added', (e) => {
      // Block during restore or before template loads
      if (this.isRestoring || !this.templateLoaded) {
        this.eventHandlers.onObjectAdded?.(e);
        return;
      }
      
      if (this.isUserAction) {
        this.shouldRecord = true;
      }
      if (!this.isRestoring && this.shouldRecord && this.isUserAction) {
        this.saveState();
      }
      this.eventHandlers.onObjectAdded?.(e);
    });

    this.canvas.on('object:removed', (e) => {
      // Block during restore or before template loads
      if (this.isRestoring || !this.templateLoaded) {
        this.eventHandlers.onObjectRemoved?.(e);
        return;
      }
      
      if (this.isUserAction) {
        this.shouldRecord = true;
      }
      if (!this.isRestoring && this.shouldRecord && this.isUserAction) {
        this.saveState();
      }
      this.eventHandlers.onObjectRemoved?.(e);
    });

    // Capture selection state early - before object:modified fires
    this.canvas.on('mouse:down', (e) => {
      const target = e.target;
      
      if (target && target !== this.canvas) {
        // Store state immediately when clicking on an object
        this.selectionStartState = {
          left: target.left,
          top: target.top,
          width: target.width,
          height: target.height,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
          angle: target.angle
        };
      }
      this.eventHandlers.onMouseDown?.(e);
    });
    
    this.canvas.on('selection:created', (e) => {
      const obj = this.canvas.getActiveObject();
      
      console.log('🎯 selection:created - About to call event handler and render');
      
      if (obj && !this.selectionStartState) {
        // Store the state when object is first selected (fallback)
        this.selectionStartState = {
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        };
      }
      
      // Call event handler
      this.eventHandlers.onSelectionCreated?.(e);
      
      console.log('🎯 selection:created - Event handler completed');
    });

    this.canvas.on('selection:updated', (e) => {
      const obj = this.canvas.getActiveObject();
      if (obj && !this.selectionStartState) {
        // Store the state if not already stored (fallback)
        this.selectionStartState = {
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        };
      }
      this.eventHandlers.onSelectionUpdated?.(e);
      
      // CRITICAL FIX: Force render after selection update
      this.canvas.renderAll();
    });

    this.canvas.on('selection:cleared', (e) => {
      this.selectionStartState = null;
      this.eventHandlers.onSelectionCleared?.(e);
      
      // CRITICAL FIX: Force render after selection cleared
      this.canvas.renderAll();
    });

    this.canvas.on('object:modified', (e) => {
      // CRITICAL: Block all object:modified handling if restoring or template not loaded
      if (this.isRestoring || !this.templateLoaded) {
        return;
      }
      
      // Only save state if object was actually dragged/scaled/rotated
      // object:modified fires even on selection, so we need to check if dragging/scaling occurred
      if (!this.isDragging && !this.isScaling) {
        // Object was just selected, not modified - skip saving
        this.eventHandlers.onObjectModified?.(e);
        // Reset flags
        this.isDragging = false;
        this.isScaling = false;
        return;
      }
      
      // Object was actually modified - save state
      this.isUserAction = true;
      this.shouldRecord = true;
      
      if (!this.isRestoring && this.shouldRecord) {
        this.saveState();
      }
      
      // Update selection start state for next comparison
      const obj = e.target;
      if (obj) {
        this.selectionStartState = {
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        };
      }
      
      // Reset flags after handling
      this.isDragging = false;
      this.isScaling = false;
      
      this.eventHandlers.onObjectModified?.(e);
    });

    this.canvas.on('text:editing:exited', (e) => {
      if (!this.isRestoring && this.shouldRecord && this.isUserAction) {
        this.saveState();
      }
    });

    this.canvas.on('object:moving', () => {
      this.isDragging = true;
      this.isUserAction = true;
    });

    this.canvas.on('object:scaling', () => {
      this.isScaling = true;
      this.isUserAction = true;
    });
    
    this.canvas.on('object:rotating', () => {
      this.isUserAction = true;
    });

    this.canvas.on('mouse:up', (e) => {
      // Reset dragging/scaling flags on mouse up
      setTimeout(() => {
        this.isDragging = false;
        this.isScaling = false;
        // Only reset user action if we're not currently modifying
        if (!this.canvas.isDragging && !this.canvas.isResizing) {
          this.isUserAction = false;
        }
        if (!this.shouldRecord) {
          this.shouldRecord = true;
        }
      }, 100);
      this.eventHandlers.onMouseUp?.(e);
    });

    this.canvas.on('mouse:over', () => {
      this.shouldRecord = false;
      this.isUserAction = false;
    });

    this.canvas.on('mouse:out', () => {
      this.shouldRecord = true;
    });

    // Selection handlers are now handled above in object:modified section
  }

  setupKeyboardShortcuts() {
    if (!this.canvas) return;

    const handleKeyDown = (e) => {
      if (!this.canvas) return;
      
      // Prevent undo/redo on accidental Ctrl+Z or Ctrl+Y
      if (e.ctrlKey && (e.key === 'z' || e.key === 'y')) {
        // Only allow undo/redo if history is valid and not during restore
        if (this.isRestoring || this.history.length === 0) {
          console.log('🚫 Blocked undo/redo: isRestoring=', this.isRestoring, 'history.length=', this.history.length);
          return;
        }
      }
      
      if (e.ctrlKey && e.key === 'a') {
        return;
      }

      const activeObject = this.canvas.getActiveObject();
      if (!activeObject) return;

      this.handleObjectShortcuts(e, activeObject);
    };

    document.addEventListener('keydown', handleKeyDown);
    this.canvas.keyboardHandler = handleKeyDown;
  }

  handleObjectShortcuts(e, activeObject) {
    if (!this.canvas) return;

    if (e.key === 'Enter' && activeObject.isEditing) {
      activeObject.exitEditing();
      this.canvas.requestRenderAll();
      e.preventDefault();
    }

    if (e.key === 'Escape' && activeObject.isEditing) {
      activeObject.exitEditing();
      this.canvas.requestRenderAll();
      e.preventDefault();
    }

    if (e.key === 'F2' && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      try {
        activeObject.enterEditing();
        activeObject.selectAll();
        this.canvas.requestRenderAll();
        e.preventDefault();
      } catch (error) {
        console.error('Error entering edit mode with F2:', error);
      }
    }

    if (e.ctrlKey && e.key === 'd') {
      this.duplicateSelectedObjects();
      e.preventDefault();
    }

    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      console.log('🔙 Undo triggered, history:', this.history.length, 'index:', this.historyIndex);
      this.undo();
      e.preventDefault();
    }

    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
      console.log('🔜 Redo triggered, history:', this.history.length, 'index:', this.historyIndex);
      this.redo();
      e.preventDefault();
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.deleteSelectedObjects();
      e.preventDefault();
    }
  }

  selectAllObjects() {
    if (!this.canvas) return;

    this.canvas.discardActiveObject();
    const allObjects = this.canvas.getObjects();
    
    if (allObjects.length > 0) {
      const fabric = window.fabric;
      const selection = new fabric.ActiveSelection(allObjects, {
        canvas: this.canvas,
      });
      this.canvas.setActiveObject(selection);
      this.canvas.requestRenderAll();
    }
  }

  duplicateSelectedObjects() {
    if (!this.canvas) return;

    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      obj.clone((cloned) => {
        cloned.set({
          left: (obj.left || 0) + 10,
          top: (obj.top || 0) + 10
        });
        this.canvas.add(cloned);
      });
    });
    
    this.canvas.requestRenderAll();
    this.saveState();
  }

  deleteSelectedObjects() {
    if (!this.canvas) return;

    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      this.canvas.remove(obj);
    });
    
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.saveState();
  }

  setupUndoRedo() {
    if (!this.canvas) return;

    // Wrap loadFromJSON to prevent accidental calls
    const originalLoadFromJSON = this.canvas.loadFromJSON.bind(this.canvas);
    this.canvas._originalLoadFromJSON = originalLoadFromJSON;
    
    this.canvas.loadFromJSON = (json, callback) => {
      const beforeCount = this.canvas.getObjects().length;
      const beforeTemplateCount = this.canvas.getObjects().filter(o => o !== this.canvas.hoverOverlay).length;
      
      // Parse to check object count
      let jsonObj = json;
      if (typeof json === 'string') {
        try {
          jsonObj = JSON.parse(json);
        } catch (e) {
          console.error('❌ Failed to parse JSON in loadFromJSON');
        }
      }
      const jsonObjectCount = jsonObj?.objects?.length || 0;
      
      // Only allow loadFromJSON during restore or if template is loaded
      if (!this.isRestoring && !this.templateLoaded) {
        console.error('❌ CRITICAL: loadFromJSON blocked - not restoring and template not loaded!');
        console.trace('Stack trace:');
        return;
      }
      
      console.log(`📥 loadFromJSON called: Before objects: ${beforeTemplateCount}, JSON objects: ${jsonObjectCount}, isRestoring=${this.isRestoring}, templateLoaded=${this.templateLoaded}`);
      
      if (jsonObjectCount === 0 && beforeTemplateCount > 0 && this.templateLoaded) {
        console.error(`❌ CRITICAL: loadFromJSON is loading EMPTY state! This will clear ${beforeTemplateCount} objects!`);
        console.trace('Stack trace for EMPTY loadFromJSON:');
      }
      
      return originalLoadFromJSON(json, callback);
    };

    this.canvas.undo = () => this.undo();
    this.canvas.redo = () => this.redo();
    this.canvas.saveState = (force = false) => this.saveState(force);
    this.canvas.canUndo = () => this.canUndo();
    this.canvas.canRedo = () => this.canRedo();
    this.canvas.markAsUserAction = () => this.markAsUserAction();
    this.canvas.initializeHistory = () => this.initializeHistory();
    this.canvas.groupSelectedObjects = () => this.groupSelectedObjects();
    this.canvas.ungroupSelectedObjects = () => this.ungroupSelectedObjects();
    this.canvas.canGroup = () => this.canGroup();
    this.canvas.canUngroup = () => this.canUngroup();
    this.canvas.markTemplateLoaded = () => { this.templateLoaded = true; console.log('✅ Template marked as loaded'); };
    // Store reference to manager for external access
    this.canvas.canvasManager = this;
  }

  groupSelectedObjects() {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    const activeObjects = this.canvas.getActiveObjects();

    if (activeObjects.length < 2) return;

    try {
      const fabric = window.fabric;
      if (!fabric) return;

      if (activeObject && activeObject.type === 'activeSelection') {
        const group = activeObject.toGroup();
        this.canvas.setActiveObject(group);
        this.canvas.requestRenderAll();
        this.markAsUserAction();
        this.saveState();
      } else {
        const objectsToGroup = activeObjects.filter((obj) => {
          return !obj.group || obj.group === this.canvas;
        });

        if (objectsToGroup.length < 2) return;

        const selection = new fabric.ActiveSelection(objectsToGroup, {
          canvas: this.canvas,
        });

        this.canvas.setActiveObject(selection);
        const group = selection.toGroup();
        group.set({
          originX: 'left',
          originY: 'top',
        });
        this.canvas.setActiveObject(group);
        this.canvas.requestRenderAll();
        this.markAsUserAction();
        this.saveState();
      }
    } catch (error) {
      console.error('Error grouping objects:', error);
    }
  }

  ungroupSelectedObjects() {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;

    try {
      const group = activeObject;
      const fabric = window.fabric;
      if (!fabric) return;

      const objects = group.getObjects();
      if (!objects || objects.length === 0) return;

      if (typeof group._restoreObjectsState === 'function') {
        group._restoreObjectsState();
      } else {
        const groupMatrix = group.calcTransformMatrix();
        objects.forEach((obj) => {
          const point = new fabric.Point(obj.left || 0, obj.top || 0);
          const transformed = fabric.util.transformPoint(point, groupMatrix);
          obj.set({
            left: transformed.x,
            top: transformed.y,
            angle: ((obj.angle || 0) + (group.angle || 0)) % 360,
            scaleX: (obj.scaleX || 1) * (group.scaleX || 1),
            scaleY: (obj.scaleY || 1) * (group.scaleY || 1),
          });
          obj.group = null;
        });
      }

      this.canvas.remove(group);
      objects.forEach((obj) => {
        this.canvas.add(obj);
      });

      objects.forEach((obj) => {
        obj.setCoords();
      });

      if (objects.length > 0) {
        if (fabric && typeof fabric.ActiveSelection !== 'undefined') {
          const activeSelection = new fabric.ActiveSelection(objects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(activeSelection);
        } else {
          this.canvas.setActiveObject(objects[objects.length - 1]);
        }
      }

      this.canvas.requestRenderAll();
      this.markAsUserAction();
      this.saveState();
    } catch (error) {
      console.error('Error ungrouping objects:', error);
    }
  }

  canGroup() {
    if (!this.canvas) return false;
    const activeObjects = this.canvas.getActiveObjects();
    return activeObjects.length >= 2;
  }

  canUngroup() {
    if (!this.canvas) return false;
    const activeObject = this.canvas.getActiveObject();
    return activeObject !== null && (activeObject.type === 'group' || activeObject.type === 'activeSelection');
  }

  saveState(force = false) {
    // CRITICAL: Block ALL state saves until template is loaded (unless forced by template load itself)
    if (!force && !this.templateLoaded) {
      console.log('🚫 Save blocked: Template not loaded yet');
      return;
    }
    
    if (!this.canvas || this.isRestoring) {
      console.log('🚫 Save blocked: no canvas or isRestoring');
      return;
    }

    const state = JSON.stringify(this.canvas.toJSON());
    const parsedState = JSON.parse(state);
    const objectCount = parsedState.objects?.length || 0;

    // CRITICAL: Never save empty states - even if it's the first state or forced
    if (objectCount === 0) {
      console.log('🚫 Blocked saving empty state (critical check)');
      return;
    }

    // Skip if same as current state
    if (this.history.length > 0 && this.history[this.historyIndex] === state) {
      console.log('🚫 Blocked saving duplicate state');
      return;
    }

    // If force is false, only save if it's a user action (existing behavior)
    // If force is true, save regardless (for template loading, etc.)
    if (!force && !this.isUserAction && !this.shouldRecord) {
      console.log('🚫 Save blocked: not user action');
      return;
    }

    console.log(`💾 Saving state: ${objectCount} objects, force=${force}, isUserAction=${this.isUserAction}, historyIndex=${this.historyIndex}, historyLength=${this.history.length}`);

    // Double-check object count before saving
    if (objectCount === 0) {
      console.error('❌ CRITICAL: Attempted to save empty state after checks! Blocking.');
      return;
    }

    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex++;

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
    
    // Verify what we just saved
    const lastSaved = JSON.parse(this.history[this.historyIndex]);
    const savedObjectCount = lastSaved.objects?.length || 0;
    console.log(`✅ State saved at index ${this.historyIndex}, total history: ${this.history.length}, saved objects: ${savedObjectCount}`);
    
    if (savedObjectCount === 0) {
      console.error('❌ CRITICAL ERROR: Empty state was saved to history! Removing it.');
      this.history.pop();
      this.historyIndex--;
    }
  }

  undo() {
    // CRITICAL: Block undo until template is loaded and we have at least one valid state
    if (!this.templateLoaded) {
      console.log('🚫 Undo blocked: Template not loaded yet');
      return;
    }
    
    if (!this.canvas || this.historyIndex <= 0 || this.isRestoring || this.history.length === 0) {
      console.log('🚫 Undo blocked:', {
        hasCanvas: !!this.canvas,
        historyIndex: this.historyIndex,
        isRestoring: this.isRestoring,
        historyLength: this.history.length,
        templateLoaded: this.templateLoaded
      });
      return;
    }

    // Find the most recent valid (non-empty) state
    let newIndex = this.historyIndex - 1;
    let foundValidState = false;
    
    while (newIndex >= 0) {
      const state = this.history[newIndex];
      if (!state) {
        newIndex--;
        continue;
      }
      
      const parsedState = typeof state === 'string' ? JSON.parse(state) : state;
      const objectCount = parsedState.objects?.length || 0;
      
      if (objectCount > 0) {
        foundValidState = true;
        break;
      }
      
      console.warn(`⚠️ Undo: Skipping empty state at index ${newIndex}`);
      newIndex--;
    }
    
    if (!foundValidState || newIndex < 0) {
      console.error('❌ Undo: No valid state found in history');
      return;
    }

    const state = this.history[newIndex];
    const parsedState = typeof state === 'string' ? JSON.parse(state) : state;
    const objectCount = parsedState.objects?.length || 0;

    console.log(`↩️ Undo: Moving from index ${this.historyIndex} to ${newIndex} (${objectCount} objects)`);
    this.historyIndex = newIndex;
    this.restoreState(state);
  }

  redo() {
    // CRITICAL: Block redo until template is loaded
    if (!this.templateLoaded) {
      console.log('🚫 Redo blocked: Template not loaded yet');
      return;
    }
    
    if (!this.canvas || this.historyIndex >= this.history.length - 1 || this.isRestoring || this.history.length === 0) {
      console.log('🚫 Redo blocked:', {
        hasCanvas: !!this.canvas,
        historyIndex: this.historyIndex,
        historyLength: this.history.length,
        isRestoring: this.isRestoring,
        templateLoaded: this.templateLoaded
      });
      return;
    }

    const newIndex = this.historyIndex + 1;
    const state = this.history[newIndex];
    
    if (!state) {
      console.warn('⚠️ Redo: No state found at index', newIndex);
      return;
    }
    
    const parsedState = typeof state === 'string' ? JSON.parse(state) : state;
    const objectCount = parsedState.objects?.length || 0;
    
    console.log(`↩️ Redo: Moving from index ${this.historyIndex} to ${newIndex} (${objectCount} objects)`);
    this.historyIndex = newIndex;
    this.restoreState(state);
  }

  restoreState(state) {
    // CRITICAL: Block ALL restores until template is loaded
    if (!this.templateLoaded) {
      console.error('❌ CRITICAL: Cannot restore - template not loaded yet!');
      return;
    }
    
    if (!this.canvas) {
      console.warn('⚠️ Cannot restore: no canvas');
      return;
    }

    try {
      const parsedState = typeof state === 'string' ? JSON.parse(state) : state;
      const objectCount = parsedState.objects?.length || 0;
      
      const beforeCount = this.canvas.getObjects().length;
      const beforeTemplateCount = this.canvas.getObjects().filter(o => o !== this.canvas.hoverOverlay).length;
      
      console.log(`↩️ RESTORE STATE CALLED: Before: ${beforeTemplateCount} template objects, Restoring: ${objectCount} objects, historyIndex: ${this.historyIndex}, historyLength: ${this.history.length}`);
      console.trace('Stack trace for restoreState():');
      
      // CRITICAL: Never restore empty states - block immediately
      if (objectCount === 0) {
        console.error(`❌ CRITICAL: Attempting to restore EMPTY state! Blocking restore. Before had ${beforeTemplateCount} objects.`);
        console.trace('Stack trace for EMPTY restoreState():');
        // Try to find a valid state in history
        for (let i = this.historyIndex - 1; i >= 0; i--) {
          const checkState = typeof this.history[i] === 'string' ? JSON.parse(this.history[i]) : this.history[i];
          if (checkState.objects && checkState.objects.length > 0) {
            console.log(`🔄 Found valid state at index ${i}, restoring that instead`);
            this.historyIndex = i;
            this.restoreState(this.history[i]);
            return;
          }
        }
        console.error('❌ No valid state found in history!');
        return;
      }

      // Prevent restore if already restoring
      if (this.isRestoring) {
        console.warn('⚠️ Already restoring, skipping duplicate restore');
        return;
      }

      this.isRestoring = true;
      this.selectionStartState = null; // Clear selection state during restore
      this.isDragging = false;
      this.isScaling = false;
      
      // Use the wrapped loadFromJSON (or original if not wrapped)
      const loadFn = this.canvas._originalLoadFromJSON || this.canvas.loadFromJSON;
      
      loadFn.call(this.canvas, state, () => {
        const actualCount = this.canvas.getObjects().length;
        const actualTemplateCount = this.canvas.getObjects().filter(o => o !== this.canvas.hoverOverlay).length;
        console.log(`✅ State restored: ${actualTemplateCount} template objects on canvas (was ${beforeTemplateCount}, restored ${objectCount})`);
        
        if (actualTemplateCount === 0) {
          console.error(`❌ CRITICAL: Restore resulted in EMPTY canvas! Had ${beforeTemplateCount}, restored ${objectCount}, now have ${actualTemplateCount}`);
          console.trace('Stack trace for empty restore result:');
          // Try to restore from current history index if it has objects
          const currentState = this.history[this.historyIndex];
          if (currentState) {
            const checkParsed = typeof currentState === 'string' ? JSON.parse(currentState) : currentState;
            if (checkParsed.objects && checkParsed.objects.length > 0) {
              console.log('🔄 Attempting recovery restore...');
              const originalLoadFromJSON = this.canvas._originalLoadFromJSON || this.canvas.loadFromJSON;
              originalLoadFromJSON.call(this.canvas, currentState, () => {
                const recoveryCount = this.canvas.getObjects().filter(o => o !== this.canvas.hoverOverlay).length;
                console.log(`🔄 Recovery: ${recoveryCount} template objects restored`);
                this.canvas.requestRenderAll();
              });
            }
          }
        }
        
        this.canvas.requestRenderAll();
        
        // Small delay to ensure render completes
        setTimeout(() => {
          this.isRestoring = false;
        }, 50);
      });
    } catch (error) {
      console.error('❌ Error restoring canvas state:', error);
      console.trace('Stack trace for restoreState error:');
      this.isRestoring = false;
    }
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  getCanvas() {
    return this.canvas;
  }

  markAsUserAction() {
    this.isUserAction = true;
    this.shouldRecord = true;
  }

  initializeHistory() {
    if (!this.canvas) return;

    this.history = [];
    this.historyIndex = -1;
    this.saveState();
  }

  dispose() {
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
      this.saveStateTimeout = null;
    }
    
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
    if (this.canvas) {
      if (this.canvas.keyboardHandler) {
        document.removeEventListener('keydown', this.canvas.keyboardHandler);
      }
      this.canvas.dispose();
      this.canvas = null;
    }
    
    this.history = [];
    this.historyIndex = -1;
  }
}

