"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";

const TemplateModal = ({ isOpen, onClose, onSave, template, isEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    content: "",
    tags: "",
    status: "draft",
    thumbnail: "",
    preview: "",
    createdBy: "System",
    renderEngine: "builder",
    canvasData: "",
    builderData: "",
    isActive: true,
    isPremium: false,
    isPopular: false,
    isNewTemplate: false,
    metadata: {
      colorScheme: "light",
      layout: "single-column",
      complexity: "moderate",
    },
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [canvasDataValid, setCanvasDataValid] = useState(true);

  useEffect(() => {
    if (isEdit && template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        category: template.category || "",
        content: template.content || "",
        tags: Array.isArray(template.tags) ? template.tags.join(", ") : template.tags || "",
        status: template.status || (template.isActive ? "active" : "draft"),
        thumbnail: template.thumbnail || "",
        preview: template.preview || template.thumbnail || "",
        createdBy: template.createdBy || "System",
        renderEngine: template.renderEngine || "builder",
        canvasData: template.canvasData ? JSON.stringify(template.canvasData, null, 2) : "",
        builderData: template.builderData ? JSON.stringify(template.builderData, null, 2) : "",
        isActive: template.isActive !== undefined ? template.isActive : true,
        isPremium: template.isPremium || false,
        isPopular: template.isPopular || false,
        isNewTemplate: template.isNewTemplate || false,
        metadata: template.metadata || {
          colorScheme: "light",
          layout: "single-column",
          complexity: "moderate",
        },
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        content: "",
        tags: "",
        status: "draft",
        thumbnail: "",
        preview: "",
        createdBy: "System",
        renderEngine: "builder",
        canvasData: "",
        builderData: "",
        isActive: true,
        isPremium: false,
        isPopular: false,
        isNewTemplate: false,
        metadata: {
          colorScheme: "light",
          layout: "single-column",
          complexity: "moderate",
        },
      });
    }
    setErrors({});
    setCanvasDataValid(true);
  }, [isEdit, template, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.startsWith("metadata.")) {
      const metadataKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate JSON for canvasData and builderData
      if (name === "canvasData" || name === "builderData") {
        if (value.trim()) {
          try {
            JSON.parse(value);
            setCanvasDataValid(true);
          } catch (e) {
            setCanvasDataValid(false);
          }
        } else {
          setCanvasDataValid(true);
        }
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Validate JSON fields if they have content
    if (formData.canvasData.trim() && !canvasDataValid) {
      newErrors.canvasData = "Invalid JSON format for Canvas Data";
    }
    if (formData.builderData.trim()) {
      try {
        JSON.parse(formData.builderData);
      } catch (e) {
        newErrors.builderData = "Invalid JSON format for Builder Data";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert tags string to array
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
        : [];

      // Parse JSON fields
      let canvasData = null;
      let builderData = null;

      if (formData.canvasData.trim()) {
        try {
          canvasData = JSON.parse(formData.canvasData);
        } catch (e) {
          toast.error("Invalid Canvas Data JSON");
          return;
        }
      }

      if (formData.builderData.trim()) {
        try {
          builderData = JSON.parse(formData.builderData);
        } catch (e) {
          toast.error("Invalid Builder Data JSON");
          return;
        }
      }

      onSave({
        ...formData,
        tags: tagsArray,
        canvasData,
        builderData,
      });
    }
  };

  const handleImportCanvasData = () => {
    const textarea = document.createElement("textarea");
    textarea.value = "Paste your canvas JSON here";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("paste");
    const pastedData = textarea.value;
    document.body.removeChild(textarea);

    if (pastedData) {
      try {
        const parsed = JSON.parse(pastedData);
        setFormData((prev) => ({
          ...prev,
          canvasData: JSON.stringify(parsed, null, 2),
        }));
        setCanvasDataValid(true);
        toast.success("Canvas data imported successfully");
      } catch (e) {
        toast.error("Invalid JSON format");
      }
    }
  };

  const categoryOptions = [
    { value: "Professional", label: "Professional" },
    { value: "Creative", label: "Creative" },
    { value: "Minimalist", label: "Minimalist" },
    { value: "Modern", label: "Modern" },
    { value: "Classic", label: "Classic" },
    { value: "Executive", label: "Executive" },
    { value: "Resume", label: "Resume" },
    { value: "Cover Letter", label: "Cover Letter" },
    { value: "CV", label: "CV" },
    { value: "Portfolio", label: "Portfolio" },
    { value: "Other", label: "Other" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
  ];

  const renderEngineOptions = [
    { value: "html", label: "HTML" },
    { value: "builder", label: "Builder" },
    { value: "canvas", label: "Canvas" },
    { value: "jsx", label: "JSX" },
  ];

  const colorSchemeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "colorful", label: "Colorful" },
  ];

  const layoutOptions = [
    { value: "single-column", label: "Single Column" },
    { value: "two-column", label: "Two Column" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const complexityOptions = [
    { value: "simple", label: "Simple" },
    { value: "moderate", label: "Moderate" },
    { value: "complex", label: "Complex" },
  ];

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Template" : "Add New Template"}
      className="max-w-5xl"
      scrollContent
      footerContent={
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Button
            text="Cancel"
            className="btn-secondary"
            onClick={onClose}
          />
          <Button
            text={isEdit ? "Update" : "Create"}
            className="btn-primary"
            onClick={handleSubmit}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "basic"
                ? "border-b-2 border-primary-500 text-primary-500"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("canvas")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "canvas"
                ? "border-b-2 border-primary-500 text-primary-500"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Canvas Data
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-b-2 border-primary-500 text-primary-500"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Settings & Metadata
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <>
              <Textinput
                label="Template Name"
                type="text"
                name="name"
                placeholder="Enter template name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name ? { message: errors.name } : null}
              />

              <Textarea
                label="Description"
                name="description"
                placeholder="Enter template description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />

              <Select
                label="Category"
                name="category"
                placeholder="Select category"
                options={categoryOptions}
                value={formData.category}
                onChange={handleChange}
                error={errors.category ? { message: errors.category } : null}
              />

              <Select
                label="Render Engine"
                name="renderEngine"
                placeholder="Select render engine"
                options={renderEngineOptions}
                value={formData.renderEngine}
                onChange={handleChange}
                description="Choose how this template will be rendered"
              />

              <Textarea
                label="Content (Legacy)"
                name="content"
                placeholder="Enter template content (optional, for legacy templates)"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                description="Legacy content field. Use Canvas Data for new templates."
              />

              <Textinput
                label="Tags (comma separated)"
                type="text"
                name="tags"
                placeholder="e.g., modern, professional, creative"
                value={formData.tags}
                onChange={handleChange}
                description="Separate tags with commas"
              />

              <Textinput
                label="Thumbnail URL"
                type="text"
                name="thumbnail"
                placeholder="Enter thumbnail image URL"
                value={formData.thumbnail}
                onChange={handleChange}
                description="URL for the template thumbnail image"
              />

              <Textinput
                label="Preview URL"
                type="text"
                name="preview"
                placeholder="Enter preview image URL"
                value={formData.preview}
                onChange={handleChange}
                description="URL for the template preview image"
              />

              <Textinput
                label="Created By"
                type="text"
                name="createdBy"
                placeholder="Enter creator name"
                value={formData.createdBy}
                onChange={handleChange}
                description="Name of the person who created this template"
              />
            </>
          )}

          {/* Canvas Data Tab */}
          {activeTab === "canvas" && (
            <>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  <strong>How to import Canvas Data:</strong>
                </p>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>Go to your resume builder at /resume-builder</li>
                  <li>Open browser console (F12) and type: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">JSON.stringify(canvas.toJSON())</code></li>
                  <li>Copy the JSON output</li>
                  <li>Paste it into the Canvas Data field below</li>
                </ol>
              </div>

              <Textarea
                label="Canvas Data (JSON)"
                name="canvasData"
                placeholder='{"version":"5.3.0","objects":[],"background":"#ffffff"}'
                value={formData.canvasData}
                onChange={handleChange}
                rows={12}
                error={errors.canvasData ? { message: errors.canvasData } : null}
                description="Fabric.js canvas JSON data. This is the main data for canvas-based templates."
                className={!canvasDataValid && formData.canvasData ? "border-danger-500" : ""}
              />

              {formData.canvasData && !canvasDataValid && (
                <div className="text-danger-500 text-sm">
                  Invalid JSON format. Please check your canvas data.
                </div>
              )}

              <Textarea
                label="Builder Data (JSON)"
                name="builderData"
                placeholder='{"components":[],"style":""}'
                value={formData.builderData}
                onChange={handleChange}
                rows={8}
                error={errors.builderData ? { message: errors.builderData } : null}
                description="Builder component data (optional). Used for builder-based templates."
              />
            </>
          )}

          {/* Settings & Metadata Tab */}
          {activeTab === "settings" && (
            <>
              <Select
                label="Status"
                name="status"
                placeholder="Select status"
                options={statusOptions}
                value={formData.status}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Active
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Premium
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Popular
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isNewTemplate"
                    checked={formData.isNewTemplate}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    New Template
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  Metadata
                </h4>

                <Select
                  label="Color Scheme"
                  name="metadata.colorScheme"
                  placeholder="Select color scheme"
                  options={colorSchemeOptions}
                  value={formData.metadata.colorScheme}
                  onChange={handleChange}
                />

                <Select
                  label="Layout"
                  name="metadata.layout"
                  placeholder="Select layout"
                  options={layoutOptions}
                  value={formData.metadata.layout}
                  onChange={handleChange}
                />

                <Select
                  label="Complexity"
                  name="metadata.complexity"
                  placeholder="Select complexity"
                  options={complexityOptions}
                  value={formData.metadata.complexity}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TemplateModal;
