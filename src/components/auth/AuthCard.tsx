import Logo from "@/components/ui/Logo";

interface AuthCardProps {
  tagline: string;
  children: React.ReactNode;
}

export default function AuthCard({ tagline, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2] px-4 py-16">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size="lg" />
          <p className="text-sm text-stone-500">{tagline}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
          {children}
        </div>
      </div>
    </div>
  );
}
