"use client";
import React from "react";
import SupportTable from "@/components/partials/table/SupportTable";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

const SupportPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Support Messages Management" />
      <SupportTable />
    </div>
  );
};

export default SupportPage;

