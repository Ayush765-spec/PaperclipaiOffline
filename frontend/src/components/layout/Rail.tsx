import {
  IconHome, IconAgents, IconTasks, IconActivity,
  IconBudget, IconOrg, IconSettings, IconLogout,
} from "../icons/index.js";

interface RailProps {
  active: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const NAV = [
  { id: "dashboard", icon: IconHome,     label: "Dashboard" },
  { id: "agents",    icon: IconAgents,   label: "Agents" },
  { id: "tasks",     icon: IconTasks,    label: "Tasks" },
  { id: "activity",  icon: IconActivity, label: "Activity" },
  { id: "budget",    icon: IconBudget,   label: "Budget" },
  { id: "org",       icon: IconOrg,      label: "Org chart" },
];

export function Rail({ active, onNavigate, onLogout }: RailProps) {
  return (
    <div style={{
      width: "var(--rail-w)", minWidth: "var(--rail-w)",
      background: "var(--bg-1)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "10px 0", gap: 2,
    }}>
      {/* Logo */}
      <div style={{
        width: 30, height: 30, background: "var(--accent)",
        borderRadius: 8, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 15, fontWeight: 700,
        color: "white", marginBottom: 12, cursor: "pointer", flexShrink: 0,
      }}>
        P
      </div>

      {NAV.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => onNavigate(id)}
          style={{
            width: 34, height: 34,
            borderRadius: "var(--radius)",
            border: "none",
            background: active === id ? "var(--bg-3)" : "transparent",
            color: active === id ? "var(--text-1)" : "var(--text-3)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.1s, color 0.1s",
          }}
        >
          <Icon size={16}/>
        </button>
      ))}

      <div style={{ flex: 1 }}/>

      <button
        title="Settings"
        style={{
          width: 34, height: 34, borderRadius: "var(--radius)", border: "none",
          background: "transparent", color: "var(--text-3)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <IconSettings size={16}/>
      </button>

      <button
        title="Sign out"
        onClick={onLogout}
        style={{
          width: 34, height: 34, borderRadius: "var(--radius)", border: "none",
          background: "transparent", color: "var(--text-3)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <IconLogout size={16}/>
      </button>
    </div>
  );
}

export { NAV };