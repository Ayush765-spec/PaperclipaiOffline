import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import { Panel }      from "../components/ui/Panel.js";
import { Button }     from "../components/ui/Button.js";
import { BudgetBar }  from "../components/ui/BudgetBar.js";
import { IconPlus }   from "../components/icons/index.js";

interface AgentsPageProps {
  onNewAgent: () => void;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function AgentsPage({ onNewAgent }: AgentsPageProps) {
  const companyId = useAuthStore((s) => s.companyId)!;

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents", companyId],
    queryFn:  () => agentsApi.list(companyId),
    refetchInterval: 15000,
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          All agents
        </span>
        <Button variant="primary" onClick={onNewAgent}><IconPlus size={12}/> Add agent</Button>
      </div>

      <Panel>
        {isLoading && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>Loading…</div>
        )}
        {agents.map((agent) => (
          <div key={agent.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
          }}>
            {/* Status dot */}
            <div style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: agent.status === "active" ? "var(--green)" : "var(--text-3)",
              boxShadow: agent.status === "active" ? "0 0 6px var(--green)" : "none",
            }}/>

            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: "var(--bg-3)", border: "1px solid var(--border-md)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "var(--text-2)", flexShrink: 0,
            }}>
              {initials(agent.name)}
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{agent.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{agent.role}</div>
            </div>

            {/* Model tag */}
            <div style={{
              fontSize: 11, color: "var(--text-3)",
              background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap",
            }}>
              {agent.model}
            </div>

            {/* Budget bar */}
            <div style={{ width: 160 }}>
              <BudgetBar
                name={agent.name}
                role={agent.role}
                used={0}
                limit={agent.monthlyTokenLimit}
              />
            </div>
          </div>
        ))}
        {!isLoading && agents.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
            No agents yet — add your first one
          </div>
        )}
      </Panel>
    </div>
  );
}