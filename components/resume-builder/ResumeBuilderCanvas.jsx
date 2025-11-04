"use client";
import { useEffect, useRef } from "react";
import { useCanvasDimensions } from "@/hooks/useCanvasDimensions";
import { FabricCanvasManager } from "@/lib/fabric-utils";
import { DEFAULT_CANVAS_CONFIG } from "@/lib/fabric-types";

export default function ResumeBuilderCanvas({ onCanvasReady, onStateChange }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const canvasManagerRef = useRef(null);
  const isInitializingRef = useRef(false);
  const onCanvasReadyRef = useRef(onCanvasReady);
  const onStateChangeRef = useRef(onStateChange);
  
  // Update refs when callbacks change
  useEffect(() => {
    onCanvasReadyRef.current = onCanvasReady;
    onStateChangeRef.current = onStateChange;
  }, [onCanvasReady, onStateChange]);

  const { dimensions, getBaseDimensions, getScaledDimensions } =
    useCanvasDimensions({
      maxWidth: 750,
      aspectRatio: 0.8,
      minWidth: 300,
      minHeight: 375,
    });

  useEffect(() => {
    const initCanvas = async () => {
      if (
        canvasRef.current &&
        !fabricCanvasRef.current &&
        !isInitializingRef.current
      ) {
        isInitializingRef.current = true;
        try {
          const baseDimensions = getBaseDimensions();
          
          const canvasConfig = {
            ...DEFAULT_CANVAS_CONFIG,
            width: baseDimensions.width,
            height: baseDimensions.height,
          };

          const canvasManager = new FabricCanvasManager(
            canvasRef.current,
            canvasConfig,
            undefined,
            {
              onObjectAdded: () => {
                if (onStateChangeRef.current && canvasManager.getCanvas()) {
                  const state = JSON.stringify(canvasManager.getCanvas()?.toJSON());
                  onStateChangeRef.current(state);
                }
              },
              onObjectRemoved: () => {
                if (onStateChangeRef.current && canvasManager.getCanvas()) {
                  const state = JSON.stringify(canvasManager.getCanvas()?.toJSON());
                  onStateChangeRef.current(state);
                }
              },
              onObjectModified: () => {
                if (onStateChangeRef.current && canvasManager.getCanvas()) {
                  const state = JSON.stringify(canvasManager.getCanvas()?.toJSON());
                  onStateChangeRef.current(state);
                }
              },
            }
          );

          const canvas = await canvasManager.initialize();

          canvas.setZoom(1);
          canvas.requestRenderAll();

          canvasManagerRef.current = canvasManager;
          fabricCanvasRef.current = canvas;
          
          canvas.restoreFromState = (state) => {
            const beforeCount = canvas.getObjects().filter(o => o !== canvas.hoverOverlay).length;
            
            // Block restore until template is loaded
            if (!canvas.templateLoaded) {
              console.warn('🚫 restoreFromState blocked: template not loaded');
              return;
            }
            
            try {
              // Parse state to check object count
              let jsonObj = state;
              if (typeof state === 'string') {
                try {
                  jsonObj = JSON.parse(state);
                } catch (e) {
                  console.error('❌ Failed to parse state in restoreFromState');
                }
              }
              const jsonObjectCount = jsonObj?.objects?.length || 0;
              
              console.log(`🔄 restoreFromState called: Before: ${beforeCount} objects, Restoring: ${jsonObjectCount} objects`);
              console.trace('Stack trace for restoreFromState():');
              
              if (jsonObjectCount === 0 && beforeCount > 0) {
                console.error(`❌ CRITICAL: restoreFromState is restoring EMPTY state! Had ${beforeCount} objects!`);
                console.trace('Stack trace for EMPTY restoreFromState():');
                return; // Block empty restores
              }
              
              canvas.loadFromJSON(state, () => {
                const afterCount = canvas.getObjects().filter(o => o !== canvas.hoverOverlay).length;
                console.log(`✅ restoreFromState completed: ${afterCount} objects on canvas (was ${beforeCount}, restored ${jsonObjectCount})`);
                canvas.requestRenderAll();
              });
            } catch (error) {
              console.error("Error restoring canvas state:", error);
              console.trace('Stack trace for restoreFromState error:');
            }
          };

          console.log("🎨 Canvas initialized successfully - Objects count:", canvas.getObjects().length);
          if (onCanvasReadyRef.current) {
            onCanvasReadyRef.current(canvas);
          }
        } catch (error) {
          console.error("Failed to initialize Fabric.js canvas:", error);
          isInitializingRef.current = false;
        }
      }
    };

    initCanvas();

    return () => {
      if (canvasManagerRef.current) {
        canvasManagerRef.current.dispose();
        canvasManagerRef.current = null;
      }
      fabricCanvasRef.current = null;
      isInitializingRef.current = false;
    };
  }, [getBaseDimensions]);

  const scaledDimensions = getScaledDimensions();

  return (
    <div
      className="w-full h-full bg-gray-50 overflow-auto"
      style={{ padding: "2rem" }}
    >
      <div
        className="canvas-zoom-wrapper"
        style={{
          width: `${getBaseDimensions().width * scaledDimensions.scale}px`,
          height: `${getBaseDimensions().height * scaledDimensions.scale}px`,
          minWidth: `${getBaseDimensions().width * scaledDimensions.scale}px`,
          minHeight: `${getBaseDimensions().height * scaledDimensions.scale}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
          flexShrink: 0,
        }}
      >
        <div
          className="bg-white shadow-lg focus:outline-none canvas-container"
          style={{
            width: `${getBaseDimensions().width}px`,
            height: `${getBaseDimensions().height}px`,
            transform: `scale3d(${scaledDimensions.scale}, ${scaledDimensions.scale}, 1)`,
            transformOrigin: "center center",
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            overflow: "visible",
            position: "relative",
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'a') {
              e.preventDefault();
              e.stopPropagation();
              if (canvasManagerRef.current) {
                canvasManagerRef.current.selectAllObjects();
              }
              return false;
            }
          }}
        >
          <canvas
            ref={canvasRef}
            className="block"
            tabIndex={-1}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              imageRendering: "-webkit-optimize-contrast",
              transform: "translateZ(0)",
              willChange: "transform",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
        </div>
      </div>
    </div>
  );
}

