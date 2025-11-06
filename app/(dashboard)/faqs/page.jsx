"use client";
import React from "react";
import FAQTable from "@/components/partials/table/FAQTable";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

const FAQsPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Frequently Asked Questions" items={["Home", "FAQs"]} />
      <div className="space-y-5">
        <FAQTable />
      </div>
    </div>
  );
};

export default FAQsPage;

