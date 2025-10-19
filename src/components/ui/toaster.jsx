"use client";

import { ToastProviderCustom } from "@/hooks/use-toast";

export function Toaster({ children }) {
  return <ToastProviderCustom>{children}</ToastProviderCustom>;
}
