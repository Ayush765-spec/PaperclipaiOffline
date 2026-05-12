import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/auth.js";

import { Rail }     from "./components/layout/Rail.js";
import { Sidebar }  from "./components/layout/Sidebar.js";
import { Topbar }   from "./components/layout/Topbar.js";

import { LoginPage }     from "./pages/LoginPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { AgentsPage }    from "./pages/AgentsPage.js";
import { TasksPage }     from "./pages/TasksPage.js";
import { BudgetPage }    from "./pages/BudgetPage.js";
import { OrgPage }       from "./pages/OrgPage.js";
import { ActivityPage }  from "./pages/ActivityPage.js";

import { NewTaskModal }  from "./modals/NewTaskModal.js";
import { NewAgentModal } from "./modals/NewAgentModal.js";

import { useQuery } from "@tanstack/react-query";
import { agentsApi, tasksApi, companiesApi } from "./lib/api.js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5000, retry: 1 } },
});

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  agents:    "Agents",
  tasks:     "Tasks",
  activity:  "Activity",
  budget:    "Budget",
  org:       "Org chart",
};

function Shell() {
  const { companyId, logout } = useAuthStore();
  const [view,  setView]  = useState("dashboard");
  const [modal, setModal] = useState<"task" | "agent" | null>(null);

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", companyId],
    queryFn:  () => agentsApi.list(companyId!),
    enabled:  !!companyId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", companyId],
    queryFn:  () => tasksApi.list(companyId!),
    enabled:  !!companyId,
  });

  const { data: company } = useQuery({
    queryKey: ["company", companyId],
    queryFn:  () => companiesApi.get(companyId!),
    enabled:  !!companyId,
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Rail
        active={view}
        onNavigate={setView}
        onLogout={handleLogout}
      />
      <Sidebar
        active={view}
        onNavigate={setView}
        companyName={company?.name ?? "Loading…"}
        agentCount={agents.length}
        taskCount={tasks.length}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title={PAGE_TITLES[view] ?? view}/>

        {view === "dashboard" && (
          <DashboardPage
            onNewTask={()  => setModal("task")}
            onNewAgent={() => setModal("agent")}
          />
        )}
        {view === "agents"   && <AgentsPage   onNewAgent={() => setModal("agent")}/>}
        {view === "tasks"    && <TasksPage    onNewTask={()  => setModal("task")}/>}
        {view === "budget"   && <BudgetPage   />}
        {view === "org"      && <OrgPage      />}
        {view === "activity" && <ActivityPage />}
      </div>

      {modal === "task"  && <NewTaskModal  onClose={() => setModal(null)}/>}
      {modal === "agent" && <NewAgentModal onClose={() => setModal(null)}/>}
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthenticated ? <Shell /> : <LoginPage />}
    </QueryClientProvider>
  );
}