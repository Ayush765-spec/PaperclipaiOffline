import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tasksApi, agentsApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import { Panel }     from "../components/ui/Panel.js";
import { Badge }     from "../components/ui/Badge.js";
import { Button }    from "../components/ui/Button.js";
import { IconCheck, IconZap, IconCircle, IconPlus } from "../components/icons/index.js";

interface TasksPageProps {
  onNewTask: () => void;
}

const FILTERS = ["all", "todo", "in_progress", "done"] as const;

export function TasksPage({ onNewTask }: TasksPageProps) {
  const companyId   = useAuthStore((s) => s.companyId)!;
  const [filter, setFilter] = useState<string>("all");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", companyId],
    queryFn:  () => tasksApi.list(companyId),
    refetchInterval: 10000,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", companyId],
    queryFn:  () => agentsApi.list(companyId),
  });

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  function agentName(id: string) {
    return agents.find((a) => a.id === id)?.name ?? "—";
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {FILTERS.map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              style={filter === f ? { background: "var(--bg-3)", color: "var(--text-1)" } : {}}
            >
              {f === "in_progress" ? "running" : f}
            </Button>
          ))}
        </div>
        <Button variant="primary" onClick={onNewTask}><IconPlus size={12}/> New task</Button>
      </div>

      <Panel>
        {isLoading && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>Loading…</div>
        )}
        {filtered.map((task) => (
          <div key={task.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 16px",
            borderBottom: "1px solid var(--border)",
            cursor: "default",
          }}>
            {/* Status icon */}
            <span style={{
              color: task.status === "done" ? "var(--green)" : task.status === "in_progress" ? "var(--accent-2)" : "var(--text-3)",
              display: "flex", flexShrink: 0,
            }}>
              {task.status === "done"        ? <IconCheck  size={14}/> :
               task.status === "in_progress" ? <IconZap    size={14}/> :
                                               <IconCircle size={14}/>}
            </span>

            {/* Title */}
            <div style={{ flex: 1, fontSize: 13, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.title}
            </div>

            {/* Agent */}
            <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap" }}>
              {agentName(task.agentId)}
            </span>

            {/* Badge */}
            <Badge variant={task.status === "in_progress" ? "running" : task.status as "todo" | "done" | "blocked"}>
              {task.status === "in_progress" ? "running" : task.status}
            </Badge>

            {/* Time */}
            <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", minWidth: 60, textAlign: "right" }}>
              {timeAgo(task.createdAt)}
            </span>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
            No tasks {filter !== "all" ? `with status "${filter}"` : "yet"}
          </div>
        )}
      </Panel>
    </div>
  );
}