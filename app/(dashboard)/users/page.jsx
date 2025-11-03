"use client";
import React from "react";
import UsersTable from "@/components/partials/table/UsersTable";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";

const UsersPage = () => {
  return (
    <div>
      <HomeBredCurbs title="Users Management" />
      <UsersTable />
    </div>
  );
};

export default UsersPage;

