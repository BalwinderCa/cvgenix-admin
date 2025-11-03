"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to analytics dashboard by default
    router.push("/analytics");
  }, [router]);

  return null;
};

export default DashboardPage;
