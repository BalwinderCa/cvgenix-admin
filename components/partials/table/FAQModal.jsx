"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

const FAQModal = ({ isOpen, onClose, onSave, faq, isEdit }) => {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 0,
    isActive: true,
    isFeatured: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && faq) {
      setFormData({
        question: faq.question || "",
        answer: faq.answer || "",
        category: faq.category || "General",
        order: faq.order || 0,
        isActive: faq.isActive !== undefined ? faq.isActive : true,
        isFeatured: faq.isFeatured || false,
      });
    } else {
      setFormData({
        question: "",
        answer: "",
        category: "General",
        order: 0,
        isActive: true,
        isFeatured: false,
      });
    }
    setErrors({});
  }, [isEdit, faq, isOpen]);

  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    const fieldName = name || id;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
    }
    if (!formData.answer.trim()) {
      newErrors.answer = "Answer is required";
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

  const categoryOptions = [
    { value: "General", label: "General" },
    { value: "Pricing", label: "Pricing" },
    { value: "Templates", label: "Templates" },
    { value: "ATS", label: "ATS" },
    { value: "Export", label: "Export" },
    { value: "Account", label: "Account" },
    { value: "Other", label: "Other" },
  ];

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit FAQ" : "Add New FAQ"}
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
          <Textinput
            label="Question"
            type="text"
            placeholder="e.g., Is my resume ATS-friendly?"
            value={formData.question}
            onChange={handleChange}
            id="question"
            error={errors.question ? { message: errors.question } : null}
          />

          <Textarea
            label="Answer"
            placeholder="Provide a detailed answer..."
            value={formData.answer}
            onChange={handleChange}
            id="answer"
            rows={6}
            error={errors.answer ? { message: errors.answer } : null}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              placeholder="Select category"
              options={categoryOptions}
              value={formData.category}
              onChange={handleChange}
              id="category"
            />

            <Textinput
              label="Display Order"
              type="number"
              placeholder="0"
              value={formData.order}
              onChange={handleChange}
              id="order"
              min="0"
            />
          </div>

          <div className="flex space-x-4 rtl:space-x-reverse">
            <Checkbox
              label="Active"
              value={formData.isActive}
              onChange={handleChange}
              id="isActive"
            />
            <Checkbox
              label="Featured"
              value={formData.isFeatured}
              onChange={handleChange}
              id="isFeatured"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default FAQModal;

