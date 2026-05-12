import { useQuery } from "@tanstack/react-query";
import { agentsApi, tasksApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import { StatCard }  from "../components/ui/StatCard.js";
import { Panel }     from "../components/ui/Panel.js";
import { Badge }     from "../components/ui/Badge.js";
import { Button }    from "../components/ui/Button.js";
import { IconCheck, IconZap, IconCircle, IconPlus } from "../components/icons/index.js";

interface DashboardProps {
  onNewTask:  () => void;
  onNewAgent: () => void;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function DashboardPage({ onNewTask, onNewAgent }: DashboardProps) {
  const companyId = useAuthStore((s) => s.companyId)!;

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", companyId],
    queryFn:  () => agentsApi.list(companyId),
    refetchInterval: 15000,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", companyId],
    queryFn:  () => tasksApi.list(companyId),
    refetchInterval: 15000,
  });

  const active  = agents.filter((a) => a.status === "active").length;
  const pending = tasks.filter((t)  => t.status === "todo").length;
  const running = tasks.filter((t)  => t.status === "in_progress").length;
  const done    = tasks.filter((t)  => t.status === "done").length;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
        <StatCard label="Active agents" value={active}  sub={`of ${agents.length} total`} />
        <StatCard label="Pending"       value={pending} sub="in queue" />
        <StatCard label="Running"       value={running} sub="in progress" />
        <StatCard label="Completed"     value={done}    sub="this session" />
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>

        {/* Agents */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Agents</span>
            <Button onClick={onNewAgent}><IconPlus size={12}/> Add</Button>
          </div>
          <Panel>
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: agent.status === "active" ? "var(--green)" : "var(--text-3)",
                  boxShadow: agent.status === "active" ? "0 0 6px var(--green)" : "none",
                }}/>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: "var(--bg-3)", border: "1px solid var(--border-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, color: "var(--text-2)", flexShrink: 0,
                }}>
                  {initials(agent.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{agent.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{agent.role}</div>
                </div>
                <div style={{
                  fontSize: 11, color: "var(--text-3)",
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                  borderRadius: 4, padding: "1px 6px",
                }}>
                  {agent.model}
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
                No agents yet
              </div>
            )}
          </Panel>
        </div>

        {/* Recent tasks */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent tasks</span>
            <Button variant="primary" onClick={onNewTask}><IconPlus size={12}/> New task</Button>
          </div>
          <Panel>
            {tasks.slice(0, 6).map((task) => {
              const agentName = agents.find((a) => a.id === task.agentId)?.name ?? "—";
              return (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 14px",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ color: task.status === "done" ? "var(--green)" : task.status === "in_progress" ? "var(--accent-2)" : "var(--text-3)", display: "flex" }}>
                    {task.status === "done"        ? <IconCheck size={14}/> :
                     task.status === "in_progress" ? <IconZap   size={14}/> :
                                                     <IconCircle size={14}/>}
                  </span>
                  <div style={{ flex: 1, fontSize: 13, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {task.title}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap" }}>{agentName}</span>
                  <Badge variant={task.status === "in_progress" ? "running" : task.status as "todo" | "done" | "blocked"}>
                    {task.status === "in_progress" ? "running" : task.status}
                  </Badge>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
                No tasks yet
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}