import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, rightElement, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-stone-700 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-stone-900 h-12",
              "placeholder:text-stone-400 outline-none transition-all duration-150",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                : "border-stone-200 hover:border-stone-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50",
              rightElement ? "pr-11" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400">
              {rightElement}
            </div>
          )}
        </div>
        {error  && <p className="flex items-center gap-1 text-xs font-medium text-red-600">⚠ {error}</p>}
        {helper && !error && <p className="text-xs text-stone-400">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
