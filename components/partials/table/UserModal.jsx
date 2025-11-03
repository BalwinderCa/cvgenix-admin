"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const UserModal = ({ isOpen, onClose, onSave, user, isEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    image: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        status: user.status || "active",
        image: user.image || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        status: "active",
        image: "",
      });
    }
    setErrors({});
  }, [isEdit, user, isOpen]);

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
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
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

  const roleOptions = [
    { value: "Admin", label: "Admin" },
    { value: "User", label: "User" },
    { value: "Manager", label: "Manager" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Add New User"}
      className="max-w-2xl"
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
            label="Full Name"
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

          <Textinput
            label="Phone"
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone ? { message: errors.phone } : null}
          />

          <Select
            label="Role"
            name="role"
            placeholder="Select role"
            options={roleOptions}
            value={formData.role}
            onChange={handleChange}
            error={errors.role ? { message: errors.role } : null}
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
            label="Image URL (Optional)"
            type="text"
            name="image"
            placeholder="Enter image URL"
            value={formData.image}
            onChange={handleChange}
            description="Leave empty to use default image"
          />
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;

