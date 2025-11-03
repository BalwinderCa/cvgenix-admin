"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import Icon from "@/components/ui/Icon";

const CompanySettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZip: "",
    companyCountry: "",
    companyWebsite: "",
    companyLogo: "",
    taxId: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings?type=company");
      const result = await response.json();

      if (result.success && result.data) {
        setFormData({
          companyName: result.data.companyName || "",
          companyEmail: result.data.companyEmail || "",
          companyPhone: result.data.companyPhone || "",
          companyAddress: result.data.companyAddress || "",
          companyCity: result.data.companyCity || "",
          companyState: result.data.companyState || "",
          companyZip: result.data.companyZip || "",
          companyCountry: result.data.companyCountry || "",
          companyWebsite: result.data.companyWebsite || "",
          companyLogo: result.data.companyLogo || "",
          taxId: result.data.taxId || "",
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
          type: "company",
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Company settings saved successfully");
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

  return (
    <Card>
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
        <div className="flex-none h-8 w-8 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex flex-col items-center justify-center text-lg">
          <Icon icon="heroicons:building-office-2" />
        </div>
        <h4 className="card-title">Company Settings</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textinput
            label="Company Name"
            type="text"
            placeholder="Enter company name"
            value={formData.companyName}
            onChange={handleChange}
            id="companyName"
          />

          <Textinput
            label="Company Email"
            type="email"
            placeholder="Enter company email"
            value={formData.companyEmail}
            onChange={handleChange}
            id="companyEmail"
          />

          <Textinput
            label="Company Phone"
            type="tel"
            placeholder="Enter company phone"
            value={formData.companyPhone}
            onChange={handleChange}
            id="companyPhone"
          />

          <Textinput
            label="Website"
            type="url"
            placeholder="https://example.com"
            value={formData.companyWebsite}
            onChange={handleChange}
            id="companyWebsite"
          />

          <Textinput
            label="Tax ID"
            type="text"
            placeholder="Enter tax ID"
            value={formData.taxId}
            onChange={handleChange}
            id="taxId"
          />

          <Textinput
            label="Company Logo URL"
            type="url"
            placeholder="Enter logo image URL"
            value={formData.companyLogo}
            onChange={handleChange}
            id="companyLogo"
          />

          <Textinput
            label="Address"
            type="text"
            placeholder="Enter company address"
            value={formData.companyAddress}
            onChange={handleChange}
            className="md:col-span-2"
            id="companyAddress"
          />

          <Textinput
            label="City"
            type="text"
            placeholder="Enter city"
            value={formData.companyCity}
            onChange={handleChange}
            id="companyCity"
          />

          <Textinput
            label="State/Province"
            type="text"
            placeholder="Enter state or province"
            value={formData.companyState}
            onChange={handleChange}
            id="companyState"
          />

          <Textinput
            label="ZIP/Postal Code"
            type="text"
            placeholder="Enter ZIP code"
            value={formData.companyZip}
            onChange={handleChange}
            id="companyZip"
          />

          <Textinput
            label="Country"
            type="text"
            placeholder="Enter country"
            value={formData.companyCountry}
            onChange={handleChange}
            id="companyCountry"
          />
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

export default CompanySettings;

