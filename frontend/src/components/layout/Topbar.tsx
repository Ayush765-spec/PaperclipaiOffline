interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <div style={{
      height: 44, minHeight: 44,
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 20px",
      background: "var(--bg)",
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>
        {title}
      </span>
    </div>
  );
}