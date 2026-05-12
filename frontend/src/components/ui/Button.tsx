import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "primary";
  type?: "button" | "submit";
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Button({
  children,
  onClick,
  variant = "ghost",
  type = "button",
  disabled = false,
  style,
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    borderRadius: "var(--radius)",
    fontSize: 12,
    fontWeight: 500,
    border: "1px solid var(--border-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    fontFamily: "var(--font)",
    transition: "background 0.1s, color 0.1s",
  };

  const variants: Record<string, React.CSSProperties> = {
    ghost:   { background: "var(--bg-2)", color: "var(--text-2)" },
    primary: { background: "var(--accent)", color: "white", borderColor: "transparent" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}