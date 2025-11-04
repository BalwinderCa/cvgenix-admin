"use client";
import { useCallback, useEffect } from "react";

export function CanvasEditManager({
  canvas,
  getFabricInstance,
  onEditToolbarUpdate,
  registerCleanup,
}) {
  const addEditFunctionality = useCallback(() => {
    if (!canvas || canvas.hasEditListeners) {
      return;
    }
    
    const eventHandlers = {};

    // Double-click to edit text functionality
    const handleDblClick = async (e) => {
      const obj = e.target;
      
      if (!obj || (obj.type !== 'textbox' && obj.type !== 'text')) {
        return;
      }

      e.e.preventDefault();
      e.e.stopPropagation();

      try {
        if (typeof obj.enterEditing === 'function') {
          obj.enterEditing();
          obj.selectAll();
          canvas.renderAll();
        } else {
          const fabric = await getFabricInstance();
          
          if (!fabric) return;
          
          const textbox = new fabric.Textbox(obj.text, {
            left: obj.left,
            top: obj.top,
            width: obj.width || 200,
            fontSize: obj.fontSize || 16,
            fontFamily: obj.fontFamily || 'Arial',
            fill: obj.fill || '#000000',
            fontWeight: obj.fontWeight || 'normal',
            fontStyle: obj.fontStyle || 'normal',
            textAlign: obj.textAlign || 'left',
            lineHeight: obj.lineHeight || 1.2,
            charSpacing: obj.charSpacing || 0,
            underline: obj.underline || false,
            textBaseline: 'alphabetic',
            originX: obj.originX || 'left',
            originY: obj.originY || 'top'
          });
          
          canvas.remove(obj);
          canvas.add(textbox);
          canvas.setActiveObject(textbox);
          textbox.enterEditing();
          textbox.selectAll();
          canvas.renderAll();
        }
      } catch (error) {
        console.error('Error entering edit mode:', error);
      }
    };
    
    canvas.on('mouse:dblclick', handleDblClick);
    eventHandlers.dblclick = handleDblClick;

    // Text editing events
    const handleEditingEntered = (e) => {
      const obj = e.target;
      if (obj) {
        obj.set({
          borderColor: '#10b981',
          borderScaleFactor: 3,
          cornerColor: '#10b981',
          cornerStrokeColor: '#10b981'
        });
        canvas.renderAll();
      }
    };

    const handleEditingExited = (e) => {
      const obj = e.target;
      if (obj) {
        obj.set({
          borderColor: '#3b82f6',
          borderScaleFactor: 2,
          cornerColor: '#ffffff',
          cornerStrokeColor: '#999999'
        });
        canvas.renderAll();
      }
    };
    
    canvas.on('text:editing:entered', handleEditingEntered);
    canvas.on('text:editing:exited', handleEditingExited);
    
    eventHandlers.editingEntered = handleEditingEntered;
    eventHandlers.editingExited = handleEditingExited;

    // Hover effects - Create green dotted box around elements on hover
    canvas.hoveredObject = null;
    canvas.hoverOverlay = null;
    
    getFabricInstance().then(fabric => {
      if (!fabric) return;
      
      const createOrUpdateOverlay = (obj) => {
        const bounds = obj.getBoundingRect();
        const padding = 5;
        
        if (canvas.hoverOverlay) {
          // Update existing overlay position and make it visible
          canvas.hoverOverlay.set({
            left: bounds.left - padding,
            top: bounds.top - padding,
            width: bounds.width + (padding * 2),
            height: bounds.height + (padding * 2),
            visible: true,
            opacity: 1
          });
        } else {
          // Create new overlay
          canvas.hoverOverlay = new fabric.Rect({
            left: bounds.left - padding,
            top: bounds.top - padding,
            width: bounds.width + (padding * 2),
            height: bounds.height + (padding * 2),
            fill: 'transparent',
            stroke: '#10b981',
            strokeWidth: 3,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            absolutePositioned: true,
            visible: true,
            opacity: 1
          });
          canvas.add(canvas.hoverOverlay);
          canvas.sendToBack(canvas.hoverOverlay);
        }
        canvas.renderAll();
      };
      
      const removeOverlay = () => {
        if (canvas.hoverOverlay) {
          try {
            // Instead of removing, just hide it
            canvas.hoverOverlay.set({ visible: false, opacity: 0 });
            console.log('👻 Hiding hover overlay from removeOverlay()');
            canvas.renderAll();
          } catch (error) {
            console.error('Error hiding hover overlay:', error);
          }
        }
      };
      
      const handleMouseOver = (e) => {
        // TEMPORARILY DISABLED hover effects to fix rendering bug
        return;
      };
      
      const handleMouseOut = (e) => {
        const obj = e.target;
        const activeObject = canvas.getActiveObject();
        
        // Skip if object is selected or is the hover overlay itself
        if (activeObject || !obj || obj === canvas.hoverOverlay) {
          return;
        }
        
        canvas.hoveredObject = null;
        if (!obj.isEditing) {
          removeOverlay();
        }
      };
      
      // Debounced mouse move for better performance
      let mouseMoveTimeout;
      const handleMouseMove = (e) => {
        if (mouseMoveTimeout) {
          clearTimeout(mouseMoveTimeout);
        }
        mouseMoveTimeout = setTimeout(() => {
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            return;
          }
          
          const obj = canvas.findTarget(e.e, false);
          
          // Show hover on all objects except the overlay itself
          if (obj && obj !== canvas.hoverOverlay) {
            if (canvas.hoveredObject !== obj) {
              canvas.hoveredObject = obj;
              if (!obj.isEditing) {
                createOrUpdateOverlay(obj);
              }
            }
          } else if (canvas.hoveredObject) {
            if (!canvas.hoveredObject.isEditing) {
              removeOverlay();
            }
            canvas.hoveredObject = null;
          }
        }, 50);
      };
      
      // TEMPORARILY DISABLED hover effects to fix rendering bug
      // canvas.on('mouse:over', handleMouseOver);
      // canvas.on('mouse:out', handleMouseOut);
      // canvas.on('mouse:move', handleMouseMove);
      
      eventHandlers.mouseOver = handleMouseOver;
      eventHandlers.mouseOut = handleMouseOut;
      eventHandlers.mouseMove = handleMouseMove;
      eventHandlers.getMouseMoveTimeout = () => mouseMoveTimeout;
    });

    // Keyboard shortcuts
    const handleKeyDown = async (e) => {
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      if (e.key === 'F2' && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
        try {
          if (typeof activeObject.enterEditing === 'function') {
            activeObject.enterEditing();
            activeObject.selectAll();
            canvas.renderAll();
            e.preventDefault();
          } else {
            const fabric = await getFabricInstance();
            
            if (fabric) {
              const textbox = new fabric.Textbox(activeObject.text, {
                left: activeObject.left,
                top: activeObject.top,
                width: activeObject.width || 200,
                fontSize: activeObject.fontSize || 16,
                fontFamily: activeObject.fontFamily || 'Arial',
                fill: activeObject.fill || '#000000',
                fontWeight: activeObject.fontWeight || 'normal',
                fontStyle: activeObject.fontStyle || 'normal',
                textAlign: activeObject.textAlign || 'left',
                lineHeight: activeObject.lineHeight || 1.2,
                charSpacing: activeObject.charSpacing || 0,
                underline: activeObject.underline || false,
                textBaseline: 'alphabetic',
                originX: activeObject.originX || 'left',
                originY: activeObject.originY || 'top'
              });
              
              canvas.remove(activeObject);
              canvas.add(textbox);
              canvas.setActiveObject(textbox);
              textbox.enterEditing();
              textbox.selectAll();
              canvas.renderAll();
            }
            e.preventDefault();
          }
        } catch (error) {
          console.error('Error entering edit mode with F2:', error);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    eventHandlers.keyboard = handleKeyDown;
    
    // Selection event listeners
    const handleSelectionCreated = (e) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        onEditToolbarUpdate({
          selectedObject: activeObject,
          showDeleteButton: true,
        });
        
        // Calculate position to avoid overlapping with selected element
        const objBounds = activeObject.getBoundingRect();
        const canvasElement = canvas.getElement();
        const canvasOffset = canvasElement.getBoundingClientRect();
        
        // Position toolbar to the right of the element with some margin
        const toolbarMargin = 20;
        const x = canvasOffset.left + objBounds.left + objBounds.width + toolbarMargin;
        
        // Position toolbar above the element, or below if not enough space above
        const viewportHeight = window.innerHeight;
        const spaceAbove = objBounds.top;
        const spaceBelow = viewportHeight - (objBounds.top + objBounds.height);
        const toolbarHeight = 50;
        
        let y;
        if (spaceAbove > toolbarHeight + 20) {
          y = canvasOffset.top + objBounds.top - toolbarHeight - 10;
        } else if (spaceBelow > toolbarHeight + 20) {
          y = canvasOffset.top + objBounds.top + objBounds.height + 10;
        } else {
          y = canvasOffset.top + objBounds.top;
        }
        
        onEditToolbarUpdate({
          editToolbarPosition: { x, y },
          showEditToolbar: true,
        });
      } else {
        onEditToolbarUpdate({
          selectedObject: null,
          showDeleteButton: false,
          showEditToolbar: false,
        });
      }
    };

    const handleSelectionUpdated = (e) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        onEditToolbarUpdate({
          selectedObject: activeObject,
          showDeleteButton: true,
        });
        
        const objBounds = activeObject.getBoundingRect();
        const canvasElement = canvas.getElement();
        const canvasOffset = canvasElement.getBoundingClientRect();
        
        const x = canvasOffset.left + (objBounds.left + objBounds.width * 0.95);
        const y = canvasOffset.top + (objBounds.top - 5);
        
        onEditToolbarUpdate({
          editToolbarPosition: { x, y },
        });
      } else {
        onEditToolbarUpdate({
          selectedObject: null,
          showDeleteButton: false,
        });
      }
    };

    const handleSelectionCleared = () => {
      onEditToolbarUpdate({
        selectedObject: null,
        showDeleteButton: false,
        showEditToolbar: false,
      });
    };
    
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);
    
    eventHandlers.selectionCreated = handleSelectionCreated;
    eventHandlers.selectionUpdated = handleSelectionUpdated;
    eventHandlers.selectionCleared = handleSelectionCleared;
    
    // Mark that edit listeners have been added
    canvas.hasEditListeners = true;
    canvas.eventHandlers = eventHandlers;
    
    // Register cleanup function
    registerCleanup(() => {
      // Remove all event listeners
      document.removeEventListener('keydown', eventHandlers.keyboard);
      canvas.off('mouse:dblclick', eventHandlers.dblclick);
      canvas.off('text:editing:entered', eventHandlers.editingEntered);
      canvas.off('text:editing:exited', eventHandlers.editingExited);
      if (eventHandlers.mouseOver) canvas.off('mouse:over', eventHandlers.mouseOver);
      if (eventHandlers.mouseOut) canvas.off('mouse:out', eventHandlers.mouseOut);
      if (eventHandlers.mouseMove) canvas.off('mouse:move', eventHandlers.mouseMove);
      if (eventHandlers.getMouseMoveTimeout) {
        const timeout = eventHandlers.getMouseMoveTimeout();
        if (timeout) clearTimeout(timeout);
      }
      canvas.off('selection:created', eventHandlers.selectionCreated);
      canvas.off('selection:updated', eventHandlers.selectionUpdated);
      canvas.off('selection:cleared', eventHandlers.selectionCleared);
      
      // Clean up hover overlay
      if (canvas.hoverOverlay) {
        try {
          canvas.remove(canvas.hoverOverlay);
          canvas.hoverOverlay = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    });
  }, [canvas, getFabricInstance, onEditToolbarUpdate, registerCleanup]);

  useEffect(() => {
    if (canvas) {
      addEditFunctionality();
    }
  }, [canvas, addEditFunctionality]);

  return null; // This component doesn't render anything
}
