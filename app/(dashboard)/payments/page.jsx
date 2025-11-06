"use client";
import React from "react";
import PaymentTable from "@/components/partials/table/PaymentTable";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

const PaymentsPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Payments Management" />
      <PaymentTable />
    </div>
  );
};

export default PaymentsPage;






