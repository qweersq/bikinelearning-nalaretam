import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 shadow-sm",
  secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200 active:bg-stone-300",
  outline:   "border-2 border-blue-700 text-blue-700 hover:bg-blue-50 active:bg-blue-100",
  ghost:     "text-blue-700 hover:bg-blue-50 active:bg-blue-100",
  danger:    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-8  px-4  text-xs  gap-1.5",
  md: "h-11 px-5  text-sm  gap-2",
  lg: "h-13 px-7  text-base gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, children, className = "", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={loading || disabled}
      className={[
        "inline-flex items-center justify-center rounded-xl font-semibold",
        "transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Memproses...
        </>
      ) : children}
    </button>
  )
);

Button.displayName = "Button";
export default Button;
