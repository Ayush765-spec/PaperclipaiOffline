type BadgeVariant = "todo" | "running" | "done" | "blocked" | "paused";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  todo:    { background: "var(--bg-3)",      color: "var(--text-3)" },
  running: { background: "var(--accent-bg)", color: "var(--accent-2)" },
  done:    { background: "var(--green-bg)",  color: "var(--green)" },
  blocked: { background: "var(--red-bg)",    color: "var(--red)" },
  paused:  { background: "var(--yellow-bg)", color: "var(--yellow)" },
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span style={{
      ...styles[variant],
      fontSize: 11,
      fontWeight: 500,
      padding: "2px 7px",
      borderRadius: 4,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {children}
    </span>
  );
}