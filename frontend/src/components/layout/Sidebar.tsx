import { NAV } from "./Rail.js";

interface SidebarProps {
  active: string;
  onNavigate: (view: string) => void;
  companyName: string;
  agentCount: number;
  taskCount: number;
}

export function Sidebar({ active, onNavigate, companyName, agentCount, taskCount }: SidebarProps) {
  const counts: Record<string, number> = {
    agents: agentCount,
    tasks: taskCount,
  };

  return (
    <div style={{
      width: "var(--sidebar-w)", minWidth: "var(--sidebar-w)",
      background: "var(--bg-1)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Company header */}
      <div style={{
        padding: "14px 12px 8px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, color: "white", flexShrink: 0,
        }}>
          {companyName[0]?.toUpperCase()}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {companyName}
        </span>
      </div>

      {/* Nav */}
      <div style={{ padding: "16px 8px 4px" }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 6px", marginBottom: 4 }}>
          Workspace
        </div>
        {NAV.map(({ id, icon: Icon, label }) => (
          <div
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 8px", borderRadius: "var(--radius)",
              cursor: "pointer",
              color: active === id ? "var(--text-1)" : "var(--text-2)",
              background: active === id ? "var(--bg-3)" : "transparent",
              fontWeight: active === id ? 500 : 400,
              fontSize: 13,
              transition: "background 0.1s, color 0.1s",
            }}
          >
            <Icon size={14}/>
            {label}
            {counts[id] !== undefined && (
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}>
                {counts[id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      {/* Heartbeat status */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
          <span className="pulse" style={{ color: "var(--green)" }}>●</span>
          {" "}Heartbeat active
        </span>
      </div>
    </div>
  );
}