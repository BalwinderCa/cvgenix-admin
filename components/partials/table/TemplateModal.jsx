"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const TemplateModal = ({ isOpen, onClose, onSave, template, isEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    content: "",
    tags: "",
    status: "draft",
    thumbnail: "",
    createdBy: "System",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        category: template.category || "",
        content: template.content || "",
        tags: Array.isArray(template.tags) ? template.tags.join(", ") : template.tags || "",
        status: template.status || "draft",
        thumbnail: template.thumbnail || "",
        createdBy: template.createdBy || "System",
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
        createdBy: "System",
      });
    }
    setErrors({});
  }, [isEdit, template, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
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

      onSave({
        ...formData,
        tags: tagsArray,
      });
    }
  };

  const categoryOptions = [
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

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Template" : "Add New Template"}
      className="max-w-3xl"
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

          <Textarea
            label="Content"
            name="content"
            placeholder="Enter template content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            error={errors.content ? { message: errors.content } : null}
            description="Enter the template content/body text"
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

          <Select
            label="Status"
            name="status"
            placeholder="Select status"
            options={statusOptions}
            value={formData.status}
            onChange={handleChange}
          />

          <Textinput
            label="Thumbnail URL (Optional)"
            type="text"
            name="thumbnail"
            placeholder="Enter thumbnail image URL"
            value={formData.thumbnail}
            onChange={handleChange}
            description="Leave empty to use default thumbnail"
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
        </div>
      </form>
    </Modal>
  );
};

export default TemplateModal;

