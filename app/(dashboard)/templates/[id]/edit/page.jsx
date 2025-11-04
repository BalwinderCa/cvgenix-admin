"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import ResumeBuilderCanvas from "@/components/resume-builder/ResumeBuilderCanvas";
import ResumeBuilderSidebar from "@/components/resume-builder/ResumeBuilderSidebar";
import ResumeBuilderTopBar from "@/components/resume-builder/ResumeBuilderTopBar";
import CanvasEditToolbar from "@/components/resume-builder/CanvasEditToolbar";
import { CanvasEditManager } from "@/components/resume-builder/CanvasEditManager";
import { useCanvasManager } from "@/hooks/useCanvasManager";
import { useCanvasDimensions } from "@/hooks/useCanvasDimensions";
import { TemplateService } from "@/services/templateService";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.id;
  const isNewTemplate = templateId === "new";

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Sidebar visible by default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [templateData, setTemplateData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedTemplateRef = useRef(false);
  const loadedTemplateIdRef = useRef(null);
  const loadTimerRef = useRef(null);
  
  // Template service instance
  const templateService = TemplateService.getInstance();
  const loadTemplateRef = useRef(null);
  const canvasInstanceRef = useRef(null);

  // Use the canvas manager hook
  const {
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
  } = useCanvasManager();

  // Canvas dimensions hook
  const { getBaseDimensions, getScaledDimensions } = useCanvasDimensions({
    maxWidth: 750,
    aspectRatio: 0.8,
    minWidth: 300,
    minHeight: 375,
  });

  const loadTemplate = useCallback(async () => {
    console.log("📥 loadTemplate() called");
    const canvas = canvasState.fabricCanvas;
    if (!canvas) {
      console.log("❌ Canvas not ready yet");
      hasLoadedTemplateRef.current = false;
      return;
    }
    
    if (loadedTemplateIdRef.current === templateId) {
      console.log("⚠️ Template already loaded, skipping duplicate load");
      return;
    }
    
    try {
      setIsLoading(true);
      loadedTemplateIdRef.current = templateId;
      
      // Use the working TemplateService
      const baseDimensions = getBaseDimensions();
      await templateService.loadTemplateIntoCanvas(canvas, templateId, baseDimensions);
      
      // Fetch template data for display
      const response = await fetch(`/api/templates/${templateId}`);
      const result = await response.json();
      if (result.success && result.data) {
        setTemplateData(result.data);
      }
      
      // Update canvas state
      const initialState = JSON.stringify(canvas.toJSON());
      updateCanvasState({ 
        canvasState: initialState, 
        currentTemplateId: templateId 
      });
      
      toast.success(`Template loaded successfully`);
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Error loading template: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [templateId, canvasState.fabricCanvas, updateCanvasState, templateService, getBaseDimensions]);

  // Update the ref when loadTemplate changes
  useEffect(() => {
    loadTemplateRef.current = loadTemplate;
  }, [loadTemplate]);

  // Track canvas instance - only trigger load when canvas first becomes available
  useEffect(() => {
    if (canvasState.fabricCanvas && canvasInstanceRef.current !== canvasState.fabricCanvas) {
      canvasInstanceRef.current = canvasState.fabricCanvas;
      console.log("✅ Canvas instance set:", canvasState.fabricCanvas);
      
      // Only load template if we haven't already loaded it
      if (!isNewTemplate && templateId && !hasLoadedTemplateRef.current && loadedTemplateIdRef.current !== templateId) {
        console.log("🚀 Canvas ready - will load template:", templateId);
        
        // Mark as attempting to load immediately
        hasLoadedTemplateRef.current = true;
        
        // Clear any existing timer
        if (loadTimerRef.current) {
          clearTimeout(loadTimerRef.current);
        }
        
        // Small delay to ensure canvas is fully initialized
        loadTimerRef.current = setTimeout(() => {
          console.log("⏰ Timer fired - calling loadTemplate()");
          const timerId = loadTimerRef.current;
          loadTimerRef.current = null;
          
          if (timerId && loadedTemplateIdRef.current !== templateId && loadTemplateRef.current) {
            loadTemplateRef.current();
          } else {
            console.log("Template already loaded or timer was cleared, skipping");
          }
        }, 500);
      }
    }
    
    return () => {
      // Clean up timer on unmount
      if (loadTimerRef.current) {
        console.log("🧹 Cleaning up timer");
        clearTimeout(loadTimerRef.current);
        loadTimerRef.current = null;
      }
    };
  }, [templateId, isNewTemplate, canvasState.fabricCanvas]);

  // Capture canvas as image and upload
  const captureCanvasAsImage = async (canvas) => {
    return new Promise((resolve, reject) => {
      try {
        // Use toDataURL to get the canvas as base64 image
        const dataURL = canvas.toDataURL({
          format: 'jpeg',
          quality: 0.9,
          multiplier: 2, // Higher quality for thumbnail
        });

        // Convert base64 data URL to blob
        const base64Data = dataURL.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // Create a file from blob
        const timestamp = Date.now();
        const fileName = `template_${templateId || 'new'}_${timestamp}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        // Create FormData and upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'thumbnail');
        formData.append('source', 'canvas');

        fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              resolve(result.data.url);
            } else {
              reject(new Error(result.error || 'Failed to upload image'));
            }
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle save template
  const handleSaveTemplate = async () => {
    if (!canvasState.fabricCanvas) {
      toast.error("Canvas not ready");
      return;
    }

    setIsSaving(true);
    try {
      const canvas = canvasState.fabricCanvas;
      const canvasData = canvas.toJSON();

      // Get template name from user or use existing
      const templateName =
        templateData?.name || prompt("Enter template name:");
      if (!templateName) {
        setIsSaving(false);
        return;
      }

      // Capture canvas as image and upload
      let thumbnailUrl = templateData?.thumbnail || "/assets/images/templates/default.jpg";
      try {
        toast.info("Capturing canvas preview...");
        thumbnailUrl = await captureCanvasAsImage(canvas);
        toast.success("Preview image captured successfully");
      } catch (error) {
        console.error("Error capturing canvas image:", error);
        toast.warning("Could not capture preview image, using existing thumbnail");
      }

      const templatePayload = {
        name: templateName,
        description: templateData?.description || "",
        category: templateData?.category || "Professional",
        renderEngine: "canvas",
        canvasData: canvasData,
        isActive: templateData?.isActive !== false,
        isPremium: templateData?.isPremium || false,
        isPopular: templateData?.isPopular || false,
        isNewTemplate: templateData?.isNewTemplate || false,
        tags: templateData?.tags || [],
        thumbnail: thumbnailUrl,
      };

      const url = isNewTemplate
        ? "/api/templates"
        : `/api/templates/${templateId}`;
      const method = isNewTemplate ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          isNewTemplate
            ? "Template created successfully"
            : "Template updated successfully"
        );
        if (isNewTemplate && result.data?._id) {
          router.push(`/templates/${result.data._id}/edit`);
        }
      } else {
        toast.error(result.error || "Failed to save template");
      }
    } catch (error) {
      toast.error("Error saving template: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle template selection (for sidebar)
  const handleTemplateSelect = useCallback(
    async (selectedTemplateId) => {
      if (
        canvasState.currentTemplateId === selectedTemplateId &&
        !isLoading
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/${selectedTemplateId}`);
        const result = await response.json();

        if (
          result.success &&
          result.data.canvasData &&
          canvasState.fabricCanvas
        ) {
          updateCanvasState({ currentTemplateId: selectedTemplateId });
          const canvas = canvasState.fabricCanvas;

          // Clear canvas
          canvas.clear();
          canvas.backgroundColor = "#ffffff";

          // Load template canvas data
          canvas.loadFromJSON(result.data.canvasData, () => {
            canvas.renderAll();
            if (canvas.saveState) {
              canvas.saveState();
            }
            const initialState = JSON.stringify(canvas.toJSON());
            updateCanvasState({ canvasState: initialState });
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load template";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      canvasState.fabricCanvas,
      canvasState.currentTemplateId,
      updateCanvasState,
      isLoading,
    ]
  );

  // Handle zoom change
  const handleZoomChange = useCallback(
    (zoom, immediate = false) => {
      if (!canvasState.fabricCanvas) return;

      try {
        const zoomValue = zoom / 100;
        const containerElement = document.querySelector(".canvas-container");
        const wrapperElement = document.querySelector(".canvas-zoom-wrapper");

        if (containerElement && wrapperElement) {
          const baseDimensions = getBaseDimensions();
          const baseWidth = baseDimensions.width;
          const baseHeight = baseDimensions.height;
          const scaledDimensions = getScaledDimensions();
          const responsiveScale = scaledDimensions.scale || 1;
          const combinedScale = responsiveScale * zoomValue;
          const scaledWidth = baseWidth * combinedScale;
          const scaledHeight = baseHeight * combinedScale;
          const newTransform = `scale3d(${combinedScale}, ${combinedScale}, 1)`;

          if (immediate) {
            wrapperElement.style.transition = "none";
            wrapperElement.style.width = `${scaledWidth}px`;
            wrapperElement.style.height = `${scaledHeight}px`;
            wrapperElement.style.minWidth = `${scaledWidth}px`;
            wrapperElement.style.minHeight = `${scaledHeight}px`;

            containerElement.style.transition = "none";
            containerElement.style.transform = newTransform;
          } else {
            wrapperElement.style.width = `${scaledWidth}px`;
            wrapperElement.style.height = `${scaledHeight}px`;
            wrapperElement.style.minWidth = `${scaledWidth}px`;
            wrapperElement.style.minHeight = `${scaledHeight}px`;

            containerElement.style.transition = "transform 0.2s ease-out";
            containerElement.style.transform = newTransform;
          }
        }

        setZoomLevel(Math.round(zoom));
      } catch (error) {
        console.error("Error setting zoom:", error);
      }
    },
    [canvasState.fabricCanvas, getScaledDimensions, getBaseDimensions]
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Canvas Error
            </h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button
              text="Go Back"
              className="btn-primary"
              onClick={() => router.push("/templates")}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <HomeBredCurbs
        title={
          isNewTemplate
            ? "Create New Template"
            : `Edit Template: ${templateData?.name || "Loading..."}`
        }
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`bg-white flex-shrink-0 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed
              ? "w-0 overflow-hidden"
              : "w-96 border-r border-gray-200"
          }`}
        >
          {!isSidebarCollapsed && (
            <ResumeBuilderSidebar
              fabricCanvas={canvasState.fabricCanvas}
            />
          )}
        </div>

        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-1/2 z-20 transition-all duration-300 ease-in-out"
          style={{
            transform: isSidebarCollapsed
              ? "translateY(-50%) scaleX(-1)"
              : "translateY(-50%)",
            left: isSidebarCollapsed ? "0" : "calc(384px - 1px)",
          }}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <div
            className={`bg-white ${
              isSidebarCollapsed
                ? "border border-gray-200 rounded-l-lg"
                : "border-t border-b border-r border-gray-200 border-l-0 rounded-r-lg"
            } hover:bg-gray-50 transition-all duration-200 ease-in-out flex items-center justify-center w-6 h-16 cursor-pointer`}
          >
            <svg
              className="w-3.5 h-3.5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </button>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  text="Back"
                  className="btn-secondary"
                  onClick={() => router.push("/templates")}
                />
                {!isNewTemplate && (
                  <Button
                    text="Reload Template"
                    className="btn-secondary"
                    onClick={() => {
                      setTemplateData(null);
                      hasLoadedTemplateRef.current = false;
                      loadTemplate();
                    }}
                    disabled={isLoading || !canvasState.fabricCanvas}
                  />
                )}
                <Button
                  text="Save Template"
                  className="btn-primary"
                  onClick={handleSaveTemplate}
                  disabled={isSaving || !canvasState.fabricCanvas}
                />
              </div>

              {/* Toolbar with Undo/Redo and Text Tools - Always Visible */}
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <ResumeBuilderTopBar
                  fabricCanvas={canvasState.fabricCanvas}
                  onSave={handleSaveTemplate}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo()}
                  canRedo={canRedo()}
                />
              </div>
            </div>
          </div>

          {/* Canvas Area with Scroll */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <p className="mt-4 text-slate-600 dark:text-slate-300">
                    Loading template...
                  </p>
                </div>
              </div>
            )}

            <ResumeBuilderCanvas
              onCanvasReady={handleCanvasReady}
              onStateChange={handleStateChange}
            />

            {/* Canvas Edit Manager */}
            {canvasState.fabricCanvas && (
              <CanvasEditManager
                canvas={canvasState.fabricCanvas}
                getFabricInstance={getFabricInstance}
                onEditToolbarUpdate={updateEditToolbarState}
                registerCleanup={registerCleanup}
              />
            )}

            {/* Fixed Footer with Controls */}
            <div className="flex-shrink-0 h-12 bg-white border-t border-gray-200 flex items-center justify-between px-4">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newZoom = Math.max(25, zoomLevel - 10);
                    handleZoomChange(newZoom, false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom Out"
                  disabled={zoomLevel <= 25}
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                    />
                  </svg>
                </button>

                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="1"
                    value={zoomLevel}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setZoomLevel(value);
                      handleZoomChange(value, true);
                    }}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoomLevel - 25) / 175) * 100}%, #e5e7eb ${((zoomLevel - 25) / 175) * 100}%, #e5e7eb 100%)`,
                    }}
                    title={`Zoom: ${zoomLevel}%`}
                  />
                  <span className="text-xs text-gray-600 min-w-[3.5rem] text-center font-medium">
                    {zoomLevel}%
                  </span>
                </div>

                <button
                  onClick={() => {
                    const newZoom = Math.min(200, zoomLevel + 10);
                    handleZoomChange(newZoom, false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom In"
                  disabled={zoomLevel >= 200}
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Toolbar Overlay - Shows when object is selected */}
      <CanvasEditToolbar
        fabricCanvas={canvasState.fabricCanvas}
        isVisible={editToolbarState.showEditToolbar}
        position={editToolbarState.editToolbarPosition}
        onClose={handleCloseEditToolbar}
      />
    </div>
  );
}

