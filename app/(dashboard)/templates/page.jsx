"use client";
import React from "react";
import TemplatesTable from "@/components/partials/table/TemplatesTable";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

const TemplatesPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Templates Management" />
      <TemplatesTable />
    </div>
  );
};

export default TemplatesPage;

