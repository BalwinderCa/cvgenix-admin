"use client";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { loadFabric } from "@/lib/fabric-loader";

export default function ResumeBuilderSidebar({
  fabricCanvas,
}) {
  const [showAllShapes, setShowAllShapes] = useState(false);
  const [showAllResumeElements, setShowAllResumeElements] = useState(false);
  const [showAllContentBlocks, setShowAllContentBlocks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Function to check if an element matches the search query
  const matchesSearch = (elementName, elementType) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      elementName.toLowerCase().includes(query) ||
      (elementType && elementType.toLowerCase().includes(query))
    );
  };

  const createFabricObject = async (objectType, options) => {
    if (!fabricCanvas) return;

    try {
      const fabric = await loadFabric();
      if (!fabric) return;

      // Mark this as a user action for undo/redo history
      if (fabricCanvas.markAsUserAction) {
        fabricCanvas.markAsUserAction();
      }

      let obj;
      switch (objectType) {
        case "Line":
          obj = new fabric.Line(options.points, options);
          break;
        case "Rect":
          obj = new fabric.Rect(options);
          break;
        case "Circle":
          obj = new fabric.Circle(options);
          break;
        case "Triangle":
          obj = new fabric.Triangle(options);
          break;
        case "Polygon":
          obj = new fabric.Polygon(options.points, options);
          break;
        case "Textbox":
          obj = new fabric.Textbox(options.text, options);
          if (obj) {
            obj.set({ textBaseline: "alphabetic" });
          }
          break;
        case "Ellipse":
          obj = new fabric.Ellipse(options);
          break;
        default:
          return;
      }

      // Set common properties
      if (objectType === "Line") {
        obj.setControlsVisibility({
          mt: false,
          mb: false,
          mtr: false,
          ml: true,
          mr: true,
          tl: false,
          tr: false,
          bl: false,
          br: false,
        });
      } else {
        obj.setControlsVisibility({
          mt: false,
          mb: false,
          mtr: false,
          ml: true,
          mr: true,
          tl: true,
          tr: true,
          bl: true,
          br: true,
        });
      }

      obj.set({
        borderColor: "#3b82f6",
        cornerColor: "#ffffff",
        cornerStrokeColor: "#999999",
        cornerStyle: "circle",
        cornerSize: 12,
        transparentCorners: false,
        borderScaleFactor: 2,
        lockRotation: true,
        hasRotatingPoint: false,
        originX: "left",
        originY: "top",
      });

      // Ensure text objects have proper anchoring
      if (obj.type === "textbox" || obj.type === "text") {
        obj.set({
          originX: "left",
          originY: "top",
        });
      }

      fabricCanvas.add(obj);
      fabricCanvas.setActiveObject(obj);
      fabricCanvas.renderAll();
    } catch (error) {
      console.error("Error creating fabric object:", error);
    }
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 text-sm">Elements</h3>
        <p className="text-xs text-gray-500">Add shapes, text, and resume elements</p>
      </div>

      {/* Content - Elements Only */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">

            {/* Search Bar */}
            <div className="relative">
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Lines */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Lines
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {matchesSearch("Line", "line") && (
                  <button
                    onClick={() =>
                      createFabricObject("Line", {
                        points: [50, 50, 200, 50],
                        left: 100,
                        top: 100,
                        stroke: "#1f2937",
                        strokeWidth: 3,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true,
                      })
                    }
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon icon="heroicons:minus" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Line</span>
                  </button>
                )}
                {matchesSearch("Dashed Line", "line") && (
                  <button
                    onClick={() =>
                      createFabricObject("Line", {
                        points: [50, 50, 200, 50],
                        left: 100,
                        top: 100,
                        stroke: "#1f2937",
                        strokeWidth: 3,
                        strokeDashArray: [10, 5],
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true,
                      })
                    }
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon icon="heroicons:minus" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Dashed Line</span>
                  </button>
                )}
                {matchesSearch("Dotted Line", "line") && (
                  <button
                    onClick={() =>
                      createFabricObject("Line", {
                        points: [50, 50, 200, 50],
                        left: 100,
                        top: 100,
                        stroke: "#1f2937",
                        strokeWidth: 3,
                        strokeDashArray: [5, 5],
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true,
                      })
                    }
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon icon="heroicons:minus" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Dotted Line</span>
                  </button>
                )}
              </div>
            </div>

            {/* Shapes */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Shapes
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {matchesSearch("Rectangle", "shape") && (
                  <button
                    onClick={() =>
                      createFabricObject("Rect", {
                        left: 100,
                        top: 100,
                        width: 100,
                        height: 100,
                        fill: "#3b82f6",
                        stroke: "#1e40af",
                        strokeWidth: 2,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true,
                      })
                    }
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon icon="heroicons:squares-2x2" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Rectangle</span>
                  </button>
                )}
                {matchesSearch("Circle", "shape") && (
                  <button
                    onClick={() =>
                      createFabricObject("Circle", {
                        left: 100,
                        top: 100,
                        radius: 50,
                        fill: "#10b981",
                        stroke: "#059669",
                        strokeWidth: 2,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true,
                      })
                    }
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon icon="heroicons:circle-stack" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Circle</span>
                  </button>
                )}
                {matchesSearch("Triangle", "shape") && (
                  <button
                    onClick={() =>
                      createFabricObject("Triangle", {
                        left: 100,
                        top: 100,
                        width: 60,
                        height: 60,
                        fill: "#f59e0b",
                        stroke: "#d97706",
                        strokeWidth: 2,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true,
                      })
                    }
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon icon="heroicons:triangle" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Triangle</span>
                  </button>
                )}
                {matchesSearch("Star", "shape") && (
                  <button
                    onClick={() =>
                      createFabricObject("Polygon", {
                        points: [
                          { x: 0, y: -40 },
                          { x: 12, y: -12 },
                          { x: 40, y: -12 },
                          { x: 20, y: 8 },
                          { x: 24, y: 40 },
                          { x: 0, y: 24 },
                          { x: -24, y: 40 },
                          { x: -20, y: 8 },
                          { x: -40, y: -12 },
                          { x: -12, y: -12 },
                        ],
                        left: 100,
                        top: 100,
                        fill: "#eab308",
                        stroke: "#ca8a04",
                        strokeWidth: 2,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true,
                      })
                    }
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Icon icon="heroicons:star" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Star</span>
                  </button>
                )}
              </div>
            </div>

            {/* Resume Elements */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Resume Elements
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text: "John Doe",
                      left: 100,
                      top: 100,
                      fontSize: 20,
                      fontFamily: "Arial",
                      fill: "#1f2937",
                      fontWeight: "bold",
                      width: 200,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:user" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Name</span>
                  </div>
                  <span className="text-xs text-gray-400">20px</span>
                </button>
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text: "Software Engineer",
                      left: 100,
                      top: 100,
                      fontSize: 16,
                      fontFamily: "Arial",
                      fill: "#374151",
                      fontWeight: "600",
                      width: 200,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:briefcase" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Job Title</span>
                  </div>
                  <span className="text-xs text-gray-400">16px</span>
                </button>
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text: "john@email.com",
                      left: 100,
                      top: 100,
                      fontSize: 12,
                      fontFamily: "Arial",
                      fill: "#6b7280",
                      width: 200,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:envelope" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text: "(555) 123-4567",
                      left: 100,
                      top: 100,
                      fontSize: 12,
                      fontFamily: "Arial",
                      fill: "#6b7280",
                      width: 200,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:phone" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Phone</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>

                {showAllResumeElements && (
                  <>
                    <button
                      onClick={() =>
                        createFabricObject("Textbox", {
                          text: "EXPERIENCE",
                          left: 100,
                          top: 100,
                          fontSize: 14,
                          fontFamily: "Arial",
                          fill: "#1f2937",
                          fontWeight: "bold",
                          width: 200,
                          lockRotation: true,
                          lockUniScaling: true,
                          lockScalingFlip: true,
                        })
                      }
                      className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon icon="heroicons:briefcase" className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Experience</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                    <button
                      onClick={() =>
                        createFabricObject("Textbox", {
                          text: "EDUCATION",
                          left: 100,
                          top: 100,
                          fontSize: 14,
                          fontFamily: "Arial",
                          fill: "#1f2937",
                          fontWeight: "bold",
                          width: 200,
                          lockRotation: true,
                          lockUniScaling: true,
                          lockScalingFlip: true,
                        })
                      }
                      className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon icon="heroicons:academic-cap" className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Education</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                    <button
                      onClick={() =>
                        createFabricObject("Textbox", {
                          text: "SKILLS",
                          left: 100,
                          top: 100,
                          fontSize: 14,
                          fontFamily: "Arial",
                          fill: "#1f2937",
                          fontWeight: "bold",
                          width: 200,
                          lockRotation: true,
                          lockUniScaling: true,
                          lockScalingFlip: true,
                        })
                      }
                      className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon icon="heroicons:bolt" className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Skills</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                    <button
                      onClick={() =>
                        createFabricObject("Textbox", {
                          text: "PROJECTS",
                          left: 100,
                          top: 100,
                          fontSize: 14,
                          fontFamily: "Arial",
                          fill: "#1f2937",
                          fontWeight: "bold",
                          width: 200,
                          lockRotation: true,
                          lockUniScaling: true,
                          lockScalingFlip: true,
                        })
                      }
                      className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon icon="heroicons:code-bracket" className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Projects</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                  </>
                )}
              </div>

              {/* Show More/Less Button */}
              <button
                onClick={() => setShowAllResumeElements(!showAllResumeElements)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
              >
                {showAllResumeElements ? "Show Less" : "Show More"} (
                {showAllResumeElements ? "4" : "4"} more)
              </button>
            </div>

            {/* Content Blocks */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Content Blocks
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text:
                        "Company Name - Job Title\n2020 - Present\n• Led development of key features\n• Managed team of 5 developers",
                      left: 100,
                      top: 100,
                      fontSize: 12,
                      fontFamily: "Arial",
                      fill: "#374151",
                      width: 300,
                      height: 80,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:document-text" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Job Entry</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text:
                        "University Name\nBachelor of Science in Computer Science\n2016 - 2020",
                      left: 100,
                      top: 100,
                      fontSize: 12,
                      fontFamily: "Arial",
                      fill: "#374151",
                      width: 300,
                      height: 60,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:academic-cap" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Education Entry</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text:
                        "• JavaScript, React, Node.js\n• Python, Django, Flask\n• SQL, MongoDB, PostgreSQL\n• AWS, Docker, Kubernetes",
                      left: 100,
                      top: 100,
                      fontSize: 12,
                      fontFamily: "Arial",
                      fill: "#374151",
                      width: 300,
                      height: 80,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:list-bullet" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Skills List</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button
                  onClick={() =>
                    createFabricObject("Textbox", {
                      text:
                        "Project Name\nA brief description of the project and its impact.\nTechnologies: React, Node.js, MongoDB",
                      left: 100,
                      top: 100,
                      fontSize: 12,
                      fontFamily: "Arial",
                      fill: "#374151",
                      width: 300,
                      height: 80,
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true,
                    })
                  }
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:code-bracket" className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Project Entry</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
