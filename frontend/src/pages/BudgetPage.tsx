import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import { Panel }     from "../components/ui/Panel.js";
import { BudgetBar } from "../components/ui/BudgetBar.js";

export function BudgetPage() {
  const companyId = useAuthStore((s) => s.companyId)!;

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", companyId],
    queryFn:  () => agentsApi.list(companyId),
  });

  const month = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Budget — {month}
        </span>
      </div>

      <Panel padding={20}>
        {agents.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
            No agents yet
          </div>
        )}
        {agents.map((agent) => (
          <BudgetBar
            key={agent.id}
            name={agent.name}
            role={agent.role}
            used={0}
            limit={agent.monthlyTokenLimit}
          />
        ))}
      </Panel>

      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 12 }}>
        Token counts update after each agent run. Hard stop is enforced when an agent reaches 100% of its monthly limit.
      </p>
    </div>
  );
}