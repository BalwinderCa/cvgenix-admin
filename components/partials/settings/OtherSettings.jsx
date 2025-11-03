"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import Icon from "@/components/ui/Icon";

const OtherSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: "CVGenix Admin",
    siteDescription: "",
    adminEmail: "",
    supportEmail: "",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    language: "en",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings?type=other");
      const result = await response.json();

      if (result.success && result.data) {
        setFormData({
          siteName: result.data.siteName || "CVGenix Admin",
          siteDescription: result.data.siteDescription || "",
          adminEmail: result.data.adminEmail || "",
          supportEmail: result.data.supportEmail || "",
          timezone: result.data.timezone || "UTC",
          dateFormat: result.data.dateFormat || "MM/DD/YYYY",
          timeFormat: result.data.timeFormat || "12h",
          language: result.data.language || "en",
          maintenanceMode: result.data.maintenanceMode || false,
          allowRegistration: result.data.allowRegistration !== undefined ? result.data.allowRegistration : true,
          emailNotifications: result.data.emailNotifications !== undefined ? result.data.emailNotifications : true,
          smsNotifications: result.data.smsNotifications || false,
        });
      }
    } catch (error) {
      toast.error("Error loading settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
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
          type: "other",
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Settings saved successfully");
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

  const dateFormatOptions = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
    { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
  ];

  const timeFormatOptions = [
    { value: "12h", label: "12 Hour" },
    { value: "24h", label: "24 Hour" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
  ];

  return (
    <Card>
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
        <div className="flex-none h-8 w-8 rounded-full bg-success-500 text-white flex flex-col items-center justify-center text-lg">
          <Icon icon="heroicons:cog-6-tooth" />
        </div>
        <h4 className="card-title">Other Settings</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textinput
              label="Site Name"
              type="text"
              placeholder="Enter site name"
              value={formData.siteName}
              onChange={handleChange}
              id="siteName"
            />

            <Textinput
              label="Admin Email"
              type="email"
              placeholder="admin@example.com"
              value={formData.adminEmail}
              onChange={handleChange}
              id="adminEmail"
            />

            <Textinput
              label="Support Email"
              type="email"
              placeholder="support@example.com"
              value={formData.supportEmail}
              onChange={handleChange}
              id="supportEmail"
            />

            <Textinput
              label="Timezone"
              type="text"
              placeholder="UTC"
              value={formData.timezone}
              onChange={handleChange}
              id="timezone"
            />

            <Select
              label="Date Format"
              placeholder="Select date format"
              options={dateFormatOptions}
              value={formData.dateFormat}
              onChange={handleChange}
              id="dateFormat"
            />

            <Select
              label="Time Format"
              placeholder="Select time format"
              options={timeFormatOptions}
              value={formData.timeFormat}
              onChange={handleChange}
              id="timeFormat"
            />

            <Select
              label="Language"
              placeholder="Select language"
              options={languageOptions}
              value={formData.language}
              onChange={handleChange}
              id="language"
            />
          </div>

          <Textinput
            label="Site Description"
            type="text"
            placeholder="Enter site description"
            value={formData.siteDescription}
            onChange={handleChange}
            className="md:col-span-2"
            id="siteDescription"
          />

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              System Settings
            </h5>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-sm font-medium text-slate-900 dark:text-white">
                    Maintenance Mode
                  </h6>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable maintenance mode to restrict site access
                  </p>
                </div>
                <Switch
                  value={formData.maintenanceMode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-sm font-medium text-slate-900 dark:text-white">
                    Allow Registration
                  </h6>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Allow new users to register
                  </p>
                </div>
                <Switch
                  value={formData.allowRegistration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, allowRegistration: e.target.checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Notification Settings
            </h5>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-sm font-medium text-slate-900 dark:text-white">
                    Email Notifications
                  </h6>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable email notifications
                  </p>
                </div>
                <Switch
                  value={formData.emailNotifications}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, emailNotifications: e.target.checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-sm font-medium text-slate-900 dark:text-white">
                    SMS Notifications
                  </h6>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable SMS notifications
                  </p>
                </div>
                <Switch
                  value={formData.smsNotifications}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, smsNotifications: e.target.checked }))
                  }
                />
              </div>
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

export default OtherSettings;

