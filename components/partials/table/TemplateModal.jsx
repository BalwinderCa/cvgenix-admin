"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Fileinput from "@/components/ui/Fileinput";
import { toast } from "react-toastify";

const TemplateModal = ({ isOpen, onClose, onSave, template, isEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    status: "draft",
    createdBy: "System",
    renderEngine: "builder",
    canvasData: "",
    builderData: "",
    isActive: true,
    isPremium: false,
    isPopular: false,
    isNewTemplate: false,
  });

  const [errors, setErrors] = useState({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (isEdit && template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        category: template.category || "",
        tags: Array.isArray(template.tags) ? template.tags.join(", ") : template.tags || "",
        status: template.status || (template.isActive ? "active" : "draft"),
        createdBy: template.createdBy || "System",
        renderEngine: template.renderEngine || "builder",
        canvasData: template.canvasData ? JSON.stringify(template.canvasData, null, 2) : "",
        builderData: template.builderData ? JSON.stringify(template.builderData, null, 2) : "",
        isActive: template.isActive !== undefined ? template.isActive : true,
        isPremium: template.isPremium || false,
        isPopular: template.isPopular || false,
        isNewTemplate: template.isNewTemplate || false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        tags: "",
        status: "draft",
        createdBy: "System",
        renderEngine: "builder",
        canvasData: "",
        builderData: "",
        isActive: true,
        isPremium: false,
        isPopular: false,
        isNewTemplate: false,
      });
    }
    setErrors({});
    setThumbnailFile(null);
    setUploadingThumbnail(false);
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
      let builderData = null;

      if (formData.builderData.trim()) {
        try {
          builderData = JSON.parse(formData.builderData);
        } catch (e) {
          toast.error("Invalid Builder Data JSON");
          return;
        }
      }

      // Keep canvasData from template if it exists (for backward compatibility)
      const canvasData = template?.canvasData || formData.canvasData || null;

      // Prepare data to send - only fields that exist in UI and database
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: tagsArray,
        status: formData.status,
        createdBy: formData.createdBy,
        renderEngine: formData.renderEngine,
        canvasData,
        builderData,
        isActive: formData.isActive,
        isPremium: formData.isPremium,
        isPopular: formData.isPopular,
        isNewTemplate: formData.isNewTemplate,
      };

      onSave(dataToSave);
    }
  };

  // Generate thumbnails using canvas API
  const generateThumbnails = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const thumbnails = {};
          
          // Generate different sizes
          const sizes = {
            small: { width: 150, height: 150 },
            medium: { width: 300, height: 300 },
            large: { width: 600, height: 600 },
            original: { width: img.width, height: img.height }
          };
          
          Object.keys(sizes).forEach((sizeKey) => {
            const { width, height } = sizes[sizeKey];
            canvas.width = width;
            canvas.height = height;
            
            // Calculate aspect ratio
            const aspectRatio = img.width / img.height;
            let drawWidth = width;
            let drawHeight = height;
            let offsetX = 0;
            let offsetY = 0;
            
            if (aspectRatio > width / height) {
              drawHeight = width / aspectRatio;
              offsetY = (height - drawHeight) / 2;
            } else {
              drawWidth = height * aspectRatio;
              offsetX = (width - drawWidth) / 2;
            }
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            
            thumbnails[sizeKey] = canvas.toDataURL('image/jpeg', 0.9);
          });
          
          resolve(thumbnails);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setThumbnailFile(file);
    setUploadingThumbnail(true);

    try {
      // Generate thumbnails
      const thumbnails = await generateThumbnails(file);
      
      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('thumbnails', JSON.stringify(thumbnails));
      formData.append('type', 'thumbnail');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const thumbnailCount = Object.keys(result.data.thumbnails || {}).length;
        toast.success(`Image uploaded successfully${thumbnailCount > 0 ? ` with ${thumbnailCount} thumbnail sizes generated` : ''}`);
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploadingThumbnail(false);
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

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Template" : "Add New Template"}
      className="max-w-4xl"
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
        <div className="space-y-4">
          {/* Basic Info */}
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

          <Textinput
            label="Tags (comma separated)"
            type="text"
            name="tags"
            placeholder="e.g., modern, professional, creative"
            value={formData.tags}
            onChange={handleChange}
            description="Separate tags with commas"
          />

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Thumbnail Image
            </label>
            <Fileinput
              name="thumbnail"
              label={uploadingThumbnail ? "Uploading..." : "Browse"}
              placeholder="Choose thumbnail image..."
              onChange={handleThumbnailUpload}
              selectedFile={thumbnailFile}
              preview
              accept="image/*"
            />
            <p className="text-xs text-slate-500 mt-1">Upload an image to automatically generate thumbnails in different sizes (small, medium, large, original)</p>
          </div>

          <Textinput
            label="Created By"
            type="text"
            name="createdBy"
            placeholder="Enter creator name"
            value={formData.createdBy}
            onChange={handleChange}
            description="Name of the person who created this template"
          />

          {/* Settings & Metadata */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Settings & Metadata
            </h4>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status || "draft"}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }));
                }}
                className="form-control py-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
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

          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TemplateModal;
