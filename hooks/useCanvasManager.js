"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export const useCanvasManager = () => {
  const [canvasState, setCanvasState] = useState({
    fabricCanvas: null,
    canvasState: null,
    currentTemplateId: "",
    isRestoring: false,
    lastRestoreAttempt: 0,
  });

  const [editToolbarState, setEditToolbarState] = useState({
    showEditToolbar: false,
    editToolbarPosition: { x: 0, y: 0 },
    selectedObject: null,
    showDeleteButton: false,
  });

  const [undoRedoState, setUndoRedoState] = useState({
    canUndo: false,
    canRedo: false,
  });

  const updateUndoRedoState = useCallback(() => {
    const { fabricCanvas } = canvasState;
    if (
      fabricCanvas &&
      typeof fabricCanvas.canUndo === "function" &&
      typeof fabricCanvas.canRedo === "function"
    ) {
      const canUndo = fabricCanvas.canUndo();
      const canRedo = fabricCanvas.canRedo();
      setUndoRedoState({ canUndo, canRedo });
    }
  }, [canvasState]);

  const isRestoringRef = useRef(false);
  const lastRestoreAttemptRef = useRef(0);
  const cleanupFunctionsRef = useRef([]);
  const fabricInstanceRef = useRef(null);

  const getFabricInstance = useCallback(async () => {
    if (!fabricInstanceRef.current) {
      const { loadFabric } = await import("@/lib/fabric-loader");
      fabricInstanceRef.current = await loadFabric();
    }
    return fabricInstanceRef.current;
  }, []);

  const canvasAssignedRef = useRef(false);
  
  const handleCanvasReady = useCallback(
    (canvas) => {
      // Only assign canvas once - prevent any re-assignments
      if (canvasAssignedRef.current) {
        console.log("⚠️ Canvas already assigned, ignoring duplicate call");
        return;
      }
      
      canvasAssignedRef.current = true;
      
      console.log(
        "🎨 Canvas ready callback triggered - Objects count:",
        canvas.getObjects().length
      );

      setCanvasState((prev) => {
        // DON'T save initial state automatically - it will be empty!
        // Let the template loading handle saving the initial state
        // This prevents overwriting the loaded template with an empty state
        
        return {
          ...prev,
          fabricCanvas: canvas,
        };
      });
    },
    [] // Empty deps - canvas reference is stable
  );

  const handleStateChange = useCallback(
    (state) => {
      setCanvasState((prev) => ({
        ...prev,
        canvasState: state,
      }));
      setTimeout(updateUndoRedoState, 100);
    },
    [updateUndoRedoState]
  );

  const handleDeleteSelected = useCallback(() => {
    const { fabricCanvas } = canvasState;
    const { selectedObject } = editToolbarState;

    if (fabricCanvas && selectedObject) {
      fabricCanvas.remove(selectedObject);
      fabricCanvas.renderAll();
      setEditToolbarState((prev) => ({
        ...prev,
        selectedObject: null,
        showDeleteButton: false,
        showEditToolbar: false,
      }));
    }
  }, [canvasState, editToolbarState]);

  const handleCloseEditToolbar = useCallback(() => {
    setEditToolbarState((prev) => ({
      ...prev,
      showEditToolbar: false,
    }));
  }, []);

  const updateEditToolbarState = useCallback((updates) => {
    setEditToolbarState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const updateCanvasState = useCallback((updates) => {
    setCanvasState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const registerCleanup = useCallback((cleanup) => {
    cleanupFunctionsRef.current.push(cleanup);
  }, []);

  const handleUndo = useCallback(() => {
    const { fabricCanvas } = canvasState;
    if (fabricCanvas && typeof fabricCanvas.undo === "function") {
      fabricCanvas.undo();
      setTimeout(updateUndoRedoState, 100);
    }
  }, [canvasState, updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    const { fabricCanvas } = canvasState;
    if (fabricCanvas && typeof fabricCanvas.redo === "function") {
      fabricCanvas.redo();
      setTimeout(updateUndoRedoState, 100);
    }
  }, [canvasState, updateUndoRedoState]);

  const canUndo = useCallback(() => {
    return undoRedoState.canUndo;
  }, [undoRedoState.canUndo]);

  const canRedo = useCallback(() => {
    return undoRedoState.canRedo;
  }, [undoRedoState.canRedo]);

  useEffect(() => {
    updateUndoRedoState();
  }, [canvasState.fabricCanvas, updateUndoRedoState]);

  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      });
      cleanupFunctionsRef.current = [];
      fabricInstanceRef.current = null;
    };
  }, []);

  return {
    canvasState,
    editToolbarState,
    getFabricInstance,
    handleCanvasReady,
    handleStateChange,
    handleDeleteSelected,
    handleCloseEditToolbar,
    updateEditToolbarState,
    updateCanvasState,
    registerCleanup,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  };
};

