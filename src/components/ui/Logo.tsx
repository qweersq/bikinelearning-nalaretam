import Link from "next/link";
import { Brain } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: { text: "text-lg", icon: "h-5 w-5" },
  md: { text: "text-xl", icon: "h-6 w-6" },
  lg: { text: "text-2xl", icon: "h-7 w-7" }
};

export default function Logo({ size = "md", href = "/" }: LogoProps) {
  const currentSize = sizes[size];
  return (
    <Link
      href={href}
      className="flex items-center gap-2 font-bold tracking-tight text-stone-900 group"
    >
      <Brain 
        className={`${currentSize.icon} text-[#2563eb] fill-[#2563eb]/10 transition-transform duration-300 group-hover:scale-110`} 
        strokeWidth={2.5}
      />
      <span className={`${currentSize.text} font-extrabold`}>
        Nalar<span className="text-[#2563eb]">Etam</span>
      </span>
    </Link>
  );
}
