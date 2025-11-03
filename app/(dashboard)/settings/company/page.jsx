"use client";
import React from "react";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";
import CompanySettings from "@/components/partials/settings/CompanySettings";

const CompanySettingsPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Company Settings" />
      <CompanySettings />
    </div>
  );
};

export default CompanySettingsPage;

