"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-red-50 p-[18px] text-sm font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-60"
    >
      <LogOut size={18} />
      {loading ? "Keluar..." : "Keluar dari Akun"}
    </button>
  );
}
