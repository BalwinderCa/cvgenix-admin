"use client";
import React from "react";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";
import PaymentSettings from "@/components/partials/settings/PaymentSettings";

const PaymentSettingsPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Payment Settings" />
      <PaymentSettings />
    </div>
  );
};

export default PaymentSettingsPage;

