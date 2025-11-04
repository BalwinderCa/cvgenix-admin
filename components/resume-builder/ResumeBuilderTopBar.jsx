"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

export default function ResumeBuilderTopBar({
  fabricCanvas,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  const [textProperties, setTextProperties] = useState({
    fontSize: 12,
    textColor: "#000000",
    fontFamily: "Arial",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: "left",
    lineHeight: 1.2,
    charSpacing: 0,
    strokeWidth: 1,
  });
  const [hasTextSelected, setHasTextSelected] = useState(false);

  const FONT_FAMILIES = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
    "Comic Sans MS",
    "Courier New",
    "Lucida Console",
    "Palatino",
    "Garamond",
    "Bookman",
    "Avant Garde",
    "Helvetica Neue",
    "Calibri",
    "Cambria",
    "Candara",
    "Century Gothic",
    "Consolas",
    "Franklin Gothic",
    "Futura",
    "Gill Sans",
    "Optima",
    "Segoe UI",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Source Sans Pro",
  ];

  // Update text properties when selection changes
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelectionChange = () => {
      try {
        const activeObject = fabricCanvas.getActiveObject();
        if (
          activeObject &&
          (activeObject.type === "textbox" || activeObject.type === "text")
        ) {
          setHasTextSelected(true);
          setTextProperties({
            fontSize: activeObject.fontSize || 12,
            textColor: activeObject.fill || "#000000",
            fontFamily: activeObject.fontFamily || "Arial",
            isBold: activeObject.fontWeight === "bold",
            isItalic: activeObject.fontStyle === "italic",
            isUnderline: activeObject.underline || false,
            textAlign: activeObject.textAlign || "left",
            lineHeight: activeObject.lineHeight || 1.2,
            charSpacing: activeObject.charSpacing || 0,
            strokeWidth: activeObject.strokeWidth || 1,
          });
        } else {
          setHasTextSelected(false);
        }
      } catch (error) {
        console.error("Error handling selection change:", error);
      }
    };

    const handleSelectionCleared = () => {
      setHasTextSelected(false);
    };

    fabricCanvas.on("selection:created", handleSelectionChange);
    fabricCanvas.on("selection:updated", handleSelectionChange);
    fabricCanvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      fabricCanvas.off("selection:created", handleSelectionChange);
      fabricCanvas.off("selection:updated", handleSelectionChange);
      fabricCanvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [fabricCanvas]);

  const applyToTextObjects = useCallback(
    (updater) => {
      if (!fabricCanvas) return false;
      try {
        const activeObject = fabricCanvas.getActiveObject();
        if (
          activeObject &&
          (activeObject.type === "textbox" || activeObject.type === "text")
        ) {
          updater(activeObject);
          fabricCanvas.renderAll();
          if (fabricCanvas.markAsUserAction) {
            fabricCanvas.markAsUserAction();
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error applying changes:", error);
        return false;
      }
    },
    [fabricCanvas]
  );

  const textOperations = useMemo(
    () => ({
      increaseFontSize: () => {
        applyToTextObjects((obj) => {
          const currentSize = obj.fontSize || 12;
          obj.set({ fontSize: Math.min(currentSize + 2, 72) });
          setTextProperties((prev) => ({
            ...prev,
            fontSize: obj.fontSize,
          }));
        });
      },
      decreaseFontSize: () => {
        applyToTextObjects((obj) => {
          const currentSize = obj.fontSize || 12;
          obj.set({ fontSize: Math.max(currentSize - 2, 8) });
          setTextProperties((prev) => ({
            ...prev,
            fontSize: obj.fontSize,
          }));
        });
      },
      changeFontFamily: (fontFamily) => {
        applyToTextObjects((obj) => {
          obj.set({ fontFamily });
          setTextProperties((prev) => ({ ...prev, fontFamily }));
        });
      },
      changeTextColor: (color) => {
        applyToTextObjects((obj) => {
          obj.set({ fill: color });
          setTextProperties((prev) => ({ ...prev, textColor: color }));
        });
      },
      alignLeft: () => {
        applyToTextObjects((obj) => {
          obj.set({ textAlign: "left" });
          setTextProperties((prev) => ({ ...prev, textAlign: "left" }));
        });
      },
      alignCenter: () => {
        applyToTextObjects((obj) => {
          obj.set({ textAlign: "center" });
          setTextProperties((prev) => ({ ...prev, textAlign: "center" }));
        });
      },
      alignRight: () => {
        applyToTextObjects((obj) => {
          obj.set({ textAlign: "right" });
          setTextProperties((prev) => ({ ...prev, textAlign: "right" }));
        });
      },
      toggleBold: () => {
        applyToTextObjects((obj) => {
          const newWeight = obj.fontWeight === "bold" ? "normal" : "bold";
          obj.set({ fontWeight: newWeight });
          setTextProperties((prev) => ({
            ...prev,
            isBold: newWeight === "bold",
          }));
        });
      },
      toggleItalic: () => {
        applyToTextObjects((obj) => {
          const newStyle = obj.fontStyle === "italic" ? "normal" : "italic";
          obj.set({ fontStyle: newStyle });
          setTextProperties((prev) => ({
            ...prev,
            isItalic: newStyle === "italic",
          }));
        });
      },
      toggleUnderline: () => {
        applyToTextObjects((obj) => {
          const newDecoration = !obj.underline;
          obj.set({ underline: newDecoration });
          setTextProperties((prev) => ({
            ...prev,
            isUnderline: newDecoration,
          }));
        });
      },
    }),
    [applyToTextObjects]
  );

  return (
    <div className="flex items-center space-x-2">
      {/* Undo/Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo"
      >
        <Icon icon="heroicons:arrow-uturn-left" className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo"
      >
        <Icon icon="heroicons:arrow-uturn-right" className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Text Alignment - Always visible, disabled when no text selected */}
      <button
        onClick={textOperations.alignLeft}
        disabled={!hasTextSelected}
        className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          textProperties.textAlign === "left" && hasTextSelected
            ? "text-primary-500 bg-primary-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Align Left"
      >
        <Icon icon="heroicons:bars-3-bottom-left" className="w-4 h-4" />
      </button>
      <button
        onClick={textOperations.alignCenter}
        disabled={!hasTextSelected}
        className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          textProperties.textAlign === "center" && hasTextSelected
            ? "text-primary-500 bg-primary-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Align Center"
      >
        <Icon icon="heroicons:bars-3" className="w-4 h-4" />
      </button>
      <button
        onClick={textOperations.alignRight}
        disabled={!hasTextSelected}
        className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          textProperties.textAlign === "right" && hasTextSelected
            ? "text-primary-500 bg-primary-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Align Right"
      >
        <Icon icon="heroicons:bars-3-bottom-right" className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Text Formatting - Always visible, disabled when no text selected */}
      <button
        onClick={textOperations.toggleBold}
        disabled={!hasTextSelected}
        className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          textProperties.isBold && hasTextSelected
            ? "text-primary-500 bg-primary-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Bold"
      >
        <Icon icon="heroicons:bold" className="w-4 h-4" />
      </button>
      <button
        onClick={textOperations.toggleItalic}
        disabled={!hasTextSelected}
        className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          textProperties.isItalic && hasTextSelected
            ? "text-primary-500 bg-primary-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Italic"
      >
        <Icon icon="heroicons:language" className="w-4 h-4" />
      </button>
      <button
        onClick={textOperations.toggleUnderline}
        disabled={!hasTextSelected}
        className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          textProperties.isUnderline && hasTextSelected
            ? "text-primary-500 bg-primary-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Underline"
      >
        <Icon icon="heroicons:underline" className="w-4 h-4" />
      </button>

      {/* Color Picker - Always visible, disabled when no text selected */}
      <div className="relative">
        <button
          onClick={() => hasTextSelected && document.getElementById("hidden-color-picker")?.click()}
          disabled={!hasTextSelected}
          className="w-6 h-6 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: textProperties.textColor }}
          title="Text Color"
        />
        <input
          id="hidden-color-picker"
          type="color"
          value={textProperties.textColor}
          onChange={(e) => textOperations.changeTextColor(e.target.value)}
          className="absolute opacity-0 pointer-events-none"
        />
      </div>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Font Size Controls - Always visible, disabled when no text selected */}
      <button
        onClick={textOperations.decreaseFontSize}
        disabled={!hasTextSelected}
        className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title="Decrease Font Size"
      >
        <Icon icon="heroicons:minus" className="w-4 h-4 text-gray-600" />
      </button>
      <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md min-w-[3rem] text-center">
        {textProperties.fontSize}
      </div>
      <button
        onClick={textOperations.increaseFontSize}
        disabled={!hasTextSelected}
        className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title="Increase Font Size"
      >
        <Icon icon="heroicons:plus" className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Font Family - Always visible, disabled when no text selected */}
      <select
        value={textProperties.fontFamily}
        onChange={(e) => textOperations.changeFontFamily(e.target.value)}
        disabled={!hasTextSelected}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: textProperties.fontFamily }}
        title="Font Family"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
}
