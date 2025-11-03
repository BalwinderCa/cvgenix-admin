"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import Icon from "@/components/ui/Icon";

const PaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "stripe",
    stripePublicKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    paypalClientId: "",
    paypalSecret: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankRoutingNumber: "",
    bankName: "",
    currency: "USD",
    taxRate: 0,
    openaiApiKey: "",
    claudeApiKey: "",
    otherApiKeys: [],
  });
  
  const [newApiKey, setNewApiKey] = useState({ name: "", key: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings?type=payment");
      const result = await response.json();

      if (result.success && result.data) {
        setFormData({
          paymentMethod: result.data.paymentMethod || "stripe",
          stripePublicKey: result.data.stripePublicKey || "",
          stripeSecretKey: result.data.stripeSecretKey || "",
          stripeWebhookSecret: result.data.stripeWebhookSecret || "",
          paypalClientId: result.data.paypalClientId || "",
          paypalSecret: result.data.paypalSecret || "",
          bankAccountName: result.data.bankAccountName || "",
          bankAccountNumber: result.data.bankAccountNumber || "",
          bankRoutingNumber: result.data.bankRoutingNumber || "",
          bankName: result.data.bankName || "",
          currency: result.data.currency || "USD",
          taxRate: result.data.taxRate || 0,
          openaiApiKey: result.data.openaiApiKey || "",
          claudeApiKey: result.data.claudeApiKey || "",
          otherApiKeys: result.data.otherApiKeys || [],
        });
      }
    } catch (error) {
      toast.error("Error loading settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "payment",
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Payment settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Error saving settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading settings...</p>
          </div>
        </div>
      </Card>
    );
  }

  const paymentMethodOptions = [
    { value: "stripe", label: "Stripe" },
    { value: "paypal", label: "PayPal" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
  ];

  return (
    <Card>
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
        <div className="flex-none h-8 w-8 rounded-full bg-primary-500 text-white flex flex-col items-center justify-center text-lg">
          <Icon icon="heroicons:credit-card" />
        </div>
        <h4 className="card-title">Payment Settings</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Payment Method"
              placeholder="Select payment method"
              options={paymentMethodOptions}
              value={formData.paymentMethod}
              onChange={handleChange}
              id="paymentMethod"
            />

            <Select
              label="Currency"
              placeholder="Select currency"
              options={currencyOptions}
              value={formData.currency}
              onChange={handleChange}
              id="currency"
            />

            <Textinput
              label="Tax Rate (%)"
              type="number"
              placeholder="0"
              value={formData.taxRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              id="taxRate"
            />
          </div>

          {/* Stripe Settings */}
          {formData.paymentMethod === "stripe" && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Stripe Settings
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textinput
                  label="Stripe Public Key"
                  type="text"
                  placeholder="pk_test_..."
                  value={formData.stripePublicKey}
                  onChange={handleChange}
                  id="stripePublicKey"
                />

                <Textinput
                  label="Stripe Secret Key"
                  type="password"
                  placeholder="sk_test_..."
                  value={formData.stripeSecretKey}
                  onChange={handleChange}
                  id="stripeSecretKey"
                />

                <Textinput
                  label="Stripe Webhook Secret"
                  type="text"
                  placeholder="whsec_..."
                  value={formData.stripeWebhookSecret}
                  onChange={handleChange}
                  className="md:col-span-2"
                  id="stripeWebhookSecret"
                />
              </div>
            </div>
          )}

          {/* PayPal Settings */}
          {formData.paymentMethod === "paypal" && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                PayPal Settings
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textinput
                  label="PayPal Client ID"
                  type="text"
                  placeholder="Enter PayPal Client ID"
                  value={formData.paypalClientId}
                  onChange={handleChange}
                  id="paypalClientId"
                />

                <Textinput
                  label="PayPal Secret"
                  type="password"
                  placeholder="Enter PayPal Secret"
                  value={formData.paypalSecret}
                  onChange={handleChange}
                  id="paypalSecret"
                />
              </div>
            </div>
          )}

          {/* Bank Transfer Settings */}
          {formData.paymentMethod === "bank_transfer" && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Bank Transfer Settings
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textinput
                  label="Bank Name"
                  type="text"
                  placeholder="Enter bank name"
                  value={formData.bankName}
                  onChange={handleChange}
                  id="bankName"
                />

                <Textinput
                  label="Account Name"
                  type="text"
                  placeholder="Enter account name"
                  value={formData.bankAccountName}
                  onChange={handleChange}
                  id="bankAccountName"
                />

                <Textinput
                  label="Account Number"
                  type="text"
                  placeholder="Enter account number"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  id="bankAccountNumber"
                />

                <Textinput
                  label="Routing Number"
                  type="text"
                  placeholder="Enter routing number"
                  value={formData.bankRoutingNumber}
                  onChange={handleChange}
                  id="bankRoutingNumber"
                />
              </div>
            </div>
          )}

          {/* Third-party API Keys */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Third-party API Keys
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textinput
                label="OpenAI API Key"
                type="password"
                placeholder="sk-..."
                value={formData.openaiApiKey}
                onChange={handleChange}
                id="openaiApiKey"
                description="Enter your OpenAI API key"
              />

              <Textinput
                label="Claude API Key"
                type="password"
                placeholder="sk-ant-..."
                value={formData.claudeApiKey}
                onChange={handleChange}
                id="claudeApiKey"
                description="Enter your Claude (Anthropic) API key"
              />
            </div>

            {/* Other API Keys */}
            <div className="mt-6">
              <h6 className="text-base font-medium text-slate-900 dark:text-white mb-4">
                Other API Keys
              </h6>

              {/* Add New API Key Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Textinput
                  label="API Key Name"
                  type="text"
                  placeholder="e.g., Google API, AWS"
                  value={newApiKey.name}
                  onChange={(e) =>
                    setNewApiKey((prev) => ({ ...prev, name: e.target.value }))
                  }
                  id="newApiKeyName"
                />
                <Textinput
                  label="API Key"
                  type="password"
                  placeholder="Enter API key"
                  value={newApiKey.key}
                  onChange={(e) =>
                    setNewApiKey((prev) => ({ ...prev, key: e.target.value }))
                  }
                  id="newApiKeyValue"
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    text="Add"
                    className="btn-primary w-full"
                    onClick={() => {
                      if (newApiKey.name && newApiKey.key) {
                        setFormData((prev) => ({
                          ...prev,
                          otherApiKeys: [...prev.otherApiKeys, { ...newApiKey }],
                        }));
                        setNewApiKey({ name: "", key: "" });
                        toast.success("API key added successfully");
                      } else {
                        toast.error("Please enter both name and key");
                      }
                    }}
                  />
                </div>
              </div>

              {/* List of Other API Keys */}
              {formData.otherApiKeys.length > 0 && (
                <div className="space-y-3">
                  {formData.otherApiKeys.map((apiKey, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white mb-1">
                          {apiKey.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {apiKey.key.substring(0, 20)}...
                        </div>
                      </div>
                      <Button
                        type="button"
                        icon="heroicons:trash"
                        className="btn-sm btn-danger"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            otherApiKeys: prev.otherApiKeys.filter(
                              (_, i) => i !== index
                            ),
                          }));
                          toast.success("API key removed");
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
          <Button
            type="button"
            text="Reset"
            className="btn-secondary"
            onClick={fetchSettings}
          />
          <Button
            type="submit"
            text={saving ? "Saving..." : "Save Changes"}
            className="btn-primary"
            disabled={saving}
            icon={saving ? null : "heroicons:check"}
          />
        </div>
      </form>
    </Card>
  );
};

export default PaymentSettings;

