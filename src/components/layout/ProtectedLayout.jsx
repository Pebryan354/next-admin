"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      addToast("Akses ditolak", "Silakan login terlebih dahulu", "warning");
      router.replace("/login");
    }
  }, []);

  return <>{children}</>;
}
