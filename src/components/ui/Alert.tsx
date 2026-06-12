type AlertType = "error" | "success" | "warning" | "info";

interface AlertProps {
  type?: AlertType;
  message: string;
  className?: string;
}

const config: Record<AlertType, { style: string; icon: string }> = {
  error:   { style: "bg-red-50 border-red-200 text-red-700",     icon: "⚠" },
  success: { style: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: "✓" },
  warning: { style: "bg-amber-50 border-amber-200 text-amber-700",  icon: "!" },
  info:    { style: "bg-blue-50 border-blue-200 text-blue-700",    icon: "i" },
};

export default function Alert({ type = "error", message, className = "" }: AlertProps) {
  const { style, icon } = config[type];
  return (
    <div className={["flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium", style, className].join(" ")}>
      <span className="mt-px shrink-0 text-base leading-none">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
