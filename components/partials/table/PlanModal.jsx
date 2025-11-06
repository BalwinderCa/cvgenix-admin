"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

const PlanModal = ({ isOpen, onClose, onSave, plan, isEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    price: 0,
    priceType: "one-time",
    credits: 0,
    creditsDescription: "Resume + ATS Analysis",
    features: [],
    status: "active",
    popular: false,
  });

  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && plan) {
      setFormData({
        title: plan.title || plan.name || "",
        subtitle: plan.subtitle || plan.description || "",
        price: plan.price || 0,
        priceType: plan.priceType || "one-time",
        credits: plan.credits || 0,
        creditsDescription: plan.creditsDescription || "Resume + ATS Analysis",
        features: plan.features || [],
        status: plan.status || "active",
        popular: plan.popular || false,
      });
    } else {
      setFormData({
        title: "",
        subtitle: "",
        price: 0,
        priceType: "one-time",
        credits: 0,
        creditsDescription: "Resume + ATS Analysis",
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
    if (!formData.title.trim()) {
      newErrors.title = "Plan title is required";
    }
    if (formData.price < 0) {
      newErrors.price = "Price must be 0 or greater";
    }
    if (formData.credits < 0) {
      newErrors.credits = "Credits must be 0 or greater";
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

  const priceTypeOptions = [
    { value: "one-time", label: "One-time" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
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
              label="Plan Title"
              type="text"
              placeholder="e.g., Starter Pack, Popular Pack"
              value={formData.title}
              onChange={handleChange}
              id="title"
              error={errors.title ? { message: errors.title } : null}
            />

            <Textinput
              label="Subtitle"
              type="text"
              placeholder="e.g., Perfect for getting started"
              value={formData.subtitle}
              onChange={handleChange}
              id="subtitle"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Select
              label="Price Type"
              placeholder="Select price type"
              options={priceTypeOptions}
              value={formData.priceType}
              onChange={handleChange}
              id="priceType"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="Credits"
              type="number"
              placeholder="0"
              value={formData.credits}
              onChange={handleChange}
              id="credits"
              min="0"
              error={errors.credits ? { message: errors.credits } : null}
              description="Number of credits included"
            />

            <Textinput
              label="Credits Description"
              type="text"
              placeholder="e.g., Resume + ATS Analysis"
              value={formData.creditsDescription}
              onChange={handleChange}
              id="creditsDescription"
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

