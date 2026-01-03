"use client";

import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function ToastProvider() {
  const { toasts, removeToast } = useToast();
  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}

