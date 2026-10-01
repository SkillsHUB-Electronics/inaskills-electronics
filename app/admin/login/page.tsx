"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Login admin sekarang lewat halaman masuk bersama.
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/id/login/"), [router]);
  return null;
}
