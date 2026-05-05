import cron from "node-cron";
import { db } from "../db/index.js";
import { agents, tasks, budgets } from "../db/schema.js";
import { eq, and, isNull } from "drizzle-orm";
import { generateID, getCurrentMonth } from "./utils.js";
import { runAgentOnTask } from "../modules/agents/ollama.adapter.js";

// Track which agents are currently running to prevent overlap
const runningAgents = new Set<string>();

async function processAgent(agent: typeof agents.$inferSelect) {
  if (runningAgents.has(agent.id)) {
    console.log(`[Heartbeat] Agent ${agent.name} already running, skipping`);
    return;
  }

  // ─── Budget check ─────────────────────────────────────────────────────────
  const budget = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.agentId, agent.id),
      eq(budgets.month, getCurrentMonth())
    ),
  });

  if (budget && budget.hardStop && budget.tokensUsed >= budget.tokensLimit) {
    console.log(`[Heartbeat] Agent ${agent.name} over budget, skipping`);
    return;
  }

  // ─── Find next available task (atomic checkout) ────────────────────────────
  const nextTask = await db.query.tasks.findFirst({
    where: and(
      eq(tasks.agentId, agent.id),
      eq(tasks.status, "todo"),
      isNull(tasks.lockedByRunId)
    ),
  });

  if (!nextTask) {
    console.log(`[Heartbeat] Agent ${agent.name} has no pending tasks`);
    return;
  }

  // Atomic checkout
  const runId = generateID();
  const result = db
    .update(tasks)
    .set({
      lockedByRunId: runId,
      lockedAt: new Date().toISOString(),
      status: "in_progress",
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(tasks.id, nextTask.id),
        eq(tasks.status, "todo"),
        isNull(tasks.lockedByRunId)
      )
    )
    .run();

  if (result.changes === 0) {
    console.log(`[Heartbeat] Task ${nextTask.id} was grabbed by another agent`);
    return;
  }

  // ─── Run the agent ─────────────────────────────────────────────────────────
  runningAgents.add(agent.id);
  console.log(
    `[Heartbeat] Starting agent ${agent.name} on task: ${nextTask.title}`
  );

  try {
    await runAgentOnTask(
      {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        model: agent.model,
        ollamaBaseUrl: agent.ollamaBaseUrl,
        systemPrompt: agent.systemPrompt,
        companyId: agent.companyId,
      },
      {
        id: nextTask.id,
        title: nextTask.title,
        description: nextTask.description,
        companyId: nextTask.companyId,
      }
    );
  } finally {
    runningAgents.delete(agent.id);

    // Update last heartbeat time
    await db
      .update(agents)
      .set({ lastHeartBeat: new Date().toISOString() })
      .where(eq(agents.id, agent.id));
  }
}

export function startHeartbeat() {
  console.log("[Heartbeat] Engine started — polling every 30 seconds");

  // Run every 30 seconds
  cron.schedule("*/30 * * * * *", async () => {
    console.log("[Heartbeat] Tick —", new Date().toISOString());

    try {
      // Get all active agents
      const activeAgents = await db.query.agents.findMany({
        where: eq(agents.status, "active"),
      });

      // Process each agent concurrently
      await Promise.allSettled(activeAgents.map(processAgent));
    } catch (error) {
      console.error("[Heartbeat] Error during tick:", error);
    }
  });
}