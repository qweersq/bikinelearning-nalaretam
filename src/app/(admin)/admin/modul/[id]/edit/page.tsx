"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/kursus");
  }, [router]);

  return <div className="p-5 text-stone-400 text-sm">Redirecting...</div>;
}
