interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "section";
}

export default function Card({ children, className = "", hover = false, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={[
        "rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        hover ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_4px_16px_rgba(37,99,235,0.12)]" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}
