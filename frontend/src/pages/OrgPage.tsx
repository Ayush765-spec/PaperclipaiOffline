import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import type { Agent } from "../lib/api.js";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div style={{
      background: "var(--bg-1)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "12px 16px",
      width: 140,
      textAlign: "center",
      cursor: "pointer",
      transition: "border-color 0.15s",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: "var(--bg-3)", border: "1px solid var(--border-md)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, color: "var(--text-2)",
        margin: "0 auto 8px",
      }}>
        {initials(agent.name)}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)" }}>{agent.name}</div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{agent.role}</div>
      <div style={{ marginTop: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 500,
          padding: "2px 6px", borderRadius: 4,
          background: agent.status === "active" ? "var(--green-bg)" : "var(--bg-3)",
          color: agent.status === "active" ? "var(--green)" : "var(--text-3)",
        }}>
          {agent.status}
        </span>
      </div>
    </div>
  );
}

const Connector = () => (
  <div style={{ width: 1, height: 24, background: "var(--border-md)", margin: "0 auto" }}/>
);

export function OrgPage() {
  const companyId = useAuthStore((s) => s.companyId)!;

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", companyId],
    queryFn:  () => agentsApi.list(companyId),
  });

  const roots    = agents.filter((a) => !a.parentAgentId);
  const children = agents.filter((a) =>  a.parentAgentId);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Org chart
        </span>
      </div>

      {agents.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
          No agents yet
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Root agents */}
        <div style={{ display: "flex", gap: 16 }}>
          {roots.map((a) => <AgentCard key={a.id} agent={a}/>)}
        </div>

        {/* Children */}
        {children.length > 0 && (
          <>
            <Connector/>
            <div style={{ display: "flex", gap: 16 }}>
              {children.map((a) => <AgentCard key={a.id} agent={a}/>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}