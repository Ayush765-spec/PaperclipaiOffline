interface BudgetBarProps {
  name: string;
  role: string;
  used: number;
  limit: number;
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export function BudgetBar({ name, role, used, limit }: BudgetBarProps) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const color = pct > 80 ? "var(--red)" : pct > 60 ? "var(--yellow)" : "var(--accent)";

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5, background: "var(--bg-3)",
            border: "1px solid var(--border-md)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 9, fontWeight: 600, color: "var(--text-2)",
          }}>
            {initials(name)}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>
            {name} <span style={{ color: "var(--text-3)" }}>· {role}</span>
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
          {used.toLocaleString()} / {limit.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s" }}/>
      </div>
    </div>
  );
}