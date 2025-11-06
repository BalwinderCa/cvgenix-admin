"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const SupportModal = ({ isOpen, onClose, onSave, support, isEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    status: "new",
    adminNotes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && support) {
      setFormData({
        name: support.name || "",
        email: support.email || "",
        subject: support.subject || "",
        message: support.message || "",
        status: support.status || "new",
        adminNotes: support.adminNotes || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        status: "new",
        adminNotes: "",
      });
    }
    setErrors({});
  }, [isEdit, support, isOpen]);

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
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
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

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "read", label: "Read" },
    { value: "replied", label: "Replied" },
    { value: "resolved", label: "Resolved" },
  ];

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Support Message" : "Add New Support Message"}
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
              label="Name"
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name ? { message: errors.name } : null}
            />

            <Textinput
              label="Email"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email ? { message: errors.email } : null}
            />
          </div>

          <Textinput
            label="Subject"
            type="text"
            name="subject"
            placeholder="Enter subject"
            value={formData.subject}
            onChange={handleChange}
            error={errors.subject ? { message: errors.subject } : null}
          />

          <Textarea
            label="Message"
            name="message"
            placeholder="Enter message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            error={errors.message ? { message: errors.message } : null}
          />

          <Select
            label="Status"
            name="status"
            placeholder="Select status"
            options={statusOptions}
            value={formData.status}
            onChange={handleChange}
          />

          <Textarea
            label="Admin Notes (Optional)"
            name="adminNotes"
            placeholder="Add internal notes about this support message"
            value={formData.adminNotes}
            onChange={handleChange}
            rows={3}
            description="These notes are only visible to admins"
          />
        </div>
      </form>
    </Modal>
  );
};

export default SupportModal;

