"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const PaymentModal = ({ isOpen, onClose, onSave, payment, isEdit }) => {
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    userEmail: "",
    amount: 0,
    currency: "USD",
    paymentMethod: "",
    transactionId: "",
    status: "pending",
    description: "",
    planId: "",
    planName: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && payment) {
      setFormData({
        userId: payment.userId || "",
        userName: payment.userName || "",
        userEmail: payment.userEmail || "",
        amount: payment.amount || 0,
        currency: payment.currency || "USD",
        paymentMethod: payment.paymentMethod || "",
        transactionId: payment.transactionId || "",
        status: payment.status || "pending",
        description: payment.description || "",
        planId: payment.planId || "",
        planName: payment.planName || "",
      });
    } else {
      setFormData({
        userId: "",
        userName: "",
        userEmail: "",
        amount: 0,
        currency: "USD",
        paymentMethod: "",
        transactionId: "",
        status: "pending",
        description: "",
        planId: "",
        planName: "",
      });
    }
    setErrors({});
  }, [isEdit, payment, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
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
    if (!formData.userId?.trim()) {
      newErrors.userId = "User ID is required";
    }
    if (!formData.userName?.trim()) {
      newErrors.userName = "User name is required";
    }
    if (!formData.userEmail?.trim()) {
      newErrors.userEmail = "User email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Invalid email format";
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }
    if (!formData.transactionId?.trim()) {
      newErrors.transactionId = "Transaction ID is required";
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

  const paymentMethodOptions = [
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "paypal", label: "PayPal" },
    { value: "stripe", label: "Stripe" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Payment" : "Add New Payment"}
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
              label="User ID"
              type="text"
              name="userId"
              placeholder="Enter user ID"
              value={formData.userId}
              onChange={handleChange}
              error={errors.userId ? { message: errors.userId } : null}
            />

            <Textinput
              label="User Name"
              type="text"
              name="userName"
              placeholder="Enter user name"
              value={formData.userName}
              onChange={handleChange}
              error={errors.userName ? { message: errors.userName } : null}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="User Email"
              type="email"
              name="userEmail"
              placeholder="Enter user email"
              value={formData.userEmail}
              onChange={handleChange}
              error={errors.userEmail ? { message: errors.userEmail } : null}
            />

            <Textinput
              label="Amount"
              type="number"
              name="amount"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              error={errors.amount ? { message: errors.amount } : null}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Currency"
              name="currency"
              placeholder="Select currency"
              options={currencyOptions}
              value={formData.currency}
              onChange={handleChange}
            />

            <Select
              label="Payment Method"
              name="paymentMethod"
              placeholder="Select payment method"
              options={paymentMethodOptions}
              value={formData.paymentMethod}
              onChange={handleChange}
              error={errors.paymentMethod ? { message: errors.paymentMethod } : null}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="Transaction ID"
              type="text"
              name="transactionId"
              placeholder="Enter transaction ID"
              value={formData.transactionId}
              onChange={handleChange}
              error={errors.transactionId ? { message: errors.transactionId } : null}
            />

            <Select
              label="Status"
              name="status"
              placeholder="Select status"
              options={statusOptions}
              value={formData.status}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="Plan ID (Optional)"
              type="text"
              name="planId"
              placeholder="Enter plan ID"
              value={formData.planId}
              onChange={handleChange}
            />

            <Textinput
              label="Plan Name (Optional)"
              type="text"
              name="planName"
              placeholder="Enter plan name"
              value={formData.planName}
              onChange={handleChange}
            />
          </div>

          <Textinput
            label="Description (Optional)"
            type="text"
            name="description"
            placeholder="Enter payment description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;






