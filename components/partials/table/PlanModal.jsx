"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

const PlanModal = ({ isOpen, onClose, onSave, plan, isEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    duration: "monthly",
    templatesEdit: 0,
    atsScore: 0,
    cvDownloads: 0,
    coverLetterDownloads: 0,
    features: [],
    status: "active",
    popular: false,
  });

  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && plan) {
      setFormData({
        name: plan.name || "",
        description: plan.description || "",
        price: plan.price || 0,
        currency: plan.currency || "USD",
        duration: plan.duration || "monthly",
        templatesEdit: plan.templatesEdit || 0,
        atsScore: plan.atsScore || 0,
        cvDownloads: plan.cvDownloads || 0,
        coverLetterDownloads: plan.coverLetterDownloads || 0,
        features: plan.features || [],
        status: plan.status || "active",
        popular: plan.popular || false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        duration: "monthly",
        templatesEdit: 0,
        atsScore: 0,
        cvDownloads: 0,
        coverLetterDownloads: 0,
        features: [],
        status: "active",
        popular: false,
      });
    }
    setNewFeature("");
    setErrors({});
  }, [isEdit, plan, isOpen]);

  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    const fieldName = name || id;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Plan name is required";
    }
    if (formData.price < 0) {
      newErrors.price = "Price must be 0 or greater";
    }
    if (formData.templatesEdit < 0) {
      newErrors.templatesEdit = "Templates edit count must be 0 or greater";
    }
    if (formData.atsScore < 0) {
      newErrors.atsScore = "ATS score must be 0 or greater";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const currencyOptions = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "CAD", label: "CAD" },
  ];

  const durationOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "lifetime", label: "Lifetime" },
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
      title={isEdit ? "Edit Plan" : "Add New Plan"}
      className="max-w-3xl"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="Plan Name"
              type="text"
              placeholder="Enter plan name"
              value={formData.name}
              onChange={handleChange}
              id="name"
              error={errors.name ? { message: errors.name } : null}
            />

            <Textinput
              label="Price"
              type="number"
              placeholder="0"
              value={formData.price}
              onChange={handleChange}
              id="price"
              min="0"
              step="0.01"
              error={errors.price ? { message: errors.price } : null}
            />
          </div>

          <Textinput
            label="Description"
            type="text"
            placeholder="Enter plan description"
            value={formData.description}
            onChange={handleChange}
            id="description"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Currency"
              placeholder="Select currency"
              options={currencyOptions}
              value={formData.currency}
              onChange={handleChange}
              id="currency"
            />

            <Select
              label="Duration"
              placeholder="Select duration"
              options={durationOptions}
              value={formData.duration}
              onChange={handleChange}
              id="duration"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="Templates Edit"
              type="number"
              placeholder="0"
              value={formData.templatesEdit}
              onChange={handleChange}
              id="templatesEdit"
              min="0"
              error={errors.templatesEdit ? { message: errors.templatesEdit } : null}
              description="Number of templates user can edit"
            />

            <Textinput
              label="ATS Score"
              type="number"
              placeholder="0"
              value={formData.atsScore}
              onChange={handleChange}
              id="atsScore"
              min="0"
              error={errors.atsScore ? { message: errors.atsScore } : null}
              description="ATS score limit"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="CV Downloads"
              type="number"
              placeholder="0"
              value={formData.cvDownloads}
              onChange={handleChange}
              id="cvDownloads"
              min="0"
              description="Number of CV downloads allowed"
            />

            <Textinput
              label="Cover Letter Downloads"
              type="number"
              placeholder="0"
              value={formData.coverLetterDownloads}
              onChange={handleChange}
              id="coverLetterDownloads"
              min="0"
              description="Number of cover letter downloads allowed"
            />
          </div>

          {/* Features */}
          <div>
            <label className="form-label">Features</label>
            <div className="flex gap-2 mb-2">
              <Textinput
                type="text"
                placeholder="Add a feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                id="newFeature"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button
                type="button"
                text="Add"
                className="btn-primary"
                onClick={handleAddFeature}
              />
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              placeholder="Select status"
              options={statusOptions}
              value={formData.status}
              onChange={handleChange}
              id="status"
            />

            <div className="flex items-center pt-6">
              <Checkbox
                label="Mark as Popular"
                name="popular"
                value={formData.popular}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PlanModal;

