import type { ReactNode, CSSProperties } from "react";

interface PanelProps {
  children: ReactNode;
  style?: CSSProperties;
  padding?: string | number;
}

export function Panel({ children, style, padding }: PanelProps) {
  return (
    <div style={{
      background: "var(--bg-1)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      ...( padding !== undefined ? { padding } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
}