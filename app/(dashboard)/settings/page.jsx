"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to company settings by default
    router.push("/settings/company");
  }, [router]);

  return null;
};

export default SettingsPage;

