"use client";
import React from "react";
import PlansTable from "@/components/partials/table/PlansTable";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

const PlansPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Plans Management" />
      <PlansTable />
    </div>
  );
};

export default PlansPage;

