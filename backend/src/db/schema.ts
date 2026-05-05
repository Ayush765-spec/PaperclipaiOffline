import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  
} from "drizzle-orm/sqlite-core";


//--Companies--
export const companies=sqliteTable("companies",{
    id:         text("id").primaryKey(),
    name:       text("name").notNull(),
    mission:    text("mission").notNull().default(""),
    createdAt:  text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt:  text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

//---Users---
export const users=sqliteTable("users",{
    id:             text("id").primaryKey(),
    companyId:      text("company_id").notNull().references(()=>companies.id),
    email:          text("email").notNull().unique(),
    passwordHash:   text("password_hash").notNull(),
    role:           text("role").notNull().default("member"),
    createdAt:      text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
//---Agents--
export const agents=sqliteTable("agents",{
    id:                 text("id").primaryKey(),
    companyId:          text("comapany_id").notNull().references(()=>companies.id),
    parentAgentId:      text("parent_agent_id"),
    name:               text("name").notNull(),
    role:               text("role").notNull(),
    title:              text("title").notNull().default(""),
    systemPrompt:       text("system_prompt").notNull().default(""),
    model:              text("model").notNull().default("llama3:latest"),
    ollamaBaseUrl:      text("ollama_base_url").notNull().default("http://localhost:11434"),
    monthlyTokenLimit:  integer("monthly_token_limit").notNull().default(100000),
    status:             text("status").notNull().default("active"),
    heartBeatIntervalMs:integer("heartbeat_interval_ms").notNull().default(60000),
    lastHeartBeat:      text("last_heartbeat_at"),
    createdAt:          text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt:          text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
//Goals(goal hierarchy--tasks track back to these)---
export const goals=sqliteTable("goals",{
    id:             text("id").primaryKey(),
    companyId:      text("company_id").notNull().references(()=> companies.id),
    parentGoalId:   text("parent_goal_id"),
    title:          text("title").notNull(),
    description:    text("description").notNull().default(""),
    status:         text("status").notNull().default("active"),
    createdAt:      text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}) ;

//Tasks

export const tasks=sqliteTable("tasks",{
    id:                 text("id").primaryKey(),
    companyId:          text("company_id").notNull().references(()=> companies.id),
    agentId:            text("agent_id").notNull().references(()=> agents.id),
    goalId:             text("goal_id").references(()=>goals.id),
    parentTaskId:       text("parent_task_id"),
    title:              text("title").notNull(),
    description:        text("descripttion").notNull().default(""),
    status:             text("status").notNull().default("todo"),
    priority:           integer("priority").notNull().default(0),
    lockedByRunId:      text("locked_by_run_id"),
    lockedAt:           text("locked_at"),
    blockedByTaskId:    text("blocked_by_task_id"),
    dueAt:              text("due_at"),
    completedAt:        text("comleted_at"),
    createdAt:          text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt:          text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
//Run (each heartbeat execution is a run)
export const runs=sqliteTable("runs",{
    id:             text("id").primaryKey(),
    taskId:         text("task_id").notNull().references(()=> tasks.id),
    agentId:        text("agent_id").notNull().references(()=>agents.id),
    status:         text("status").notNull().default("running"),
    model:          text("model").notNull(),
    promptTokens:   integer("prompt_tokens").notNull().default(0),
    outputTokens:   integer("output_tokens").notNull().default(0),
    totalTokens:    integer("total_tokens").notNull().default(0),
    output:         text("output"),
    error:          text("error"),
    toolCallsJson:  text("too_calls_json"),
    startedAt:      text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    finishedAt:     text("finished_at"),
});
//Run messages(full conversation history per run)
export const runMessages=sqliteTable("run_messages",{
    id:         text("id").primaryKey(),
    runId:      text("run_id").notNull().references(()=> runs.id),
    role:       text("role").notNull(),
    content:    text("content").notNull(),
    toolCallId:     text("tool_call_id"),
    createdAt:      text("created_att").notNull().default(sql`CURRENT_TIMESTAMP`),
});
//Budgets
export const budgets=sqliteTable("budgets",{
    id:     text("id").primaryKey(),
    agentId:        text("agent_id").notNull().references(()=>agents.id),
    companyId:      text('company_id').notNull().references(()=> companies.id),
    month:          text("month").notNull(),
    tokensUsed:     integer("tokens_used").notNull().default(0),
    tokensLimit:    integer("tokens_limit").notNull().default(100000),
    hardStop:       integer("hard_stop",{mode:"boolean"}).notNull().default(true),
    createdAt:      text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt:      text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
//Secrets
export const secrets=sqliteTable("secrets",{
    id:                 text("id").primaryKey(),
    companyId:          text("company_id").notNull().references(()=> companies.id),
    key:                text("key").notNull(),
    encryptedValue:     text("encrypted_value").notNull(),
    createdAt:          text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
//skills(Agents.md //skill.md content injected at runtime)
export const skills =sqliteTable("skills",{
    id:         text("id").primaryKey(),
    agentId:    text("agent_id").references(()=> agents.id),
    companyId:  text("comapny_id").notNull().references(()=>companies.id),
    name:       text("name") .notNull(),
    content:    text("content").notNull(),
    createdAt:  text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

});
export const routines=sqliteTable("routines",{
    id:         text("id").primaryKey(),
    companyId:      text("company_id").notNull().references(()=>companies.id),
    agentId: text("agent_id").notNull().references(()=>agents.id),
    name:   text("name").notNull(),
    description:    text("description").notNull().default(""),
    cronExpr:   text("cron_expr").notNull(),
    isActive:   integer("is_active",{mode:"boolean"}).notNull().default(true),
    lastRunAt:  text("last_run_at"),
    nextRunAt:  text("next_run_at"),
    createdAt:  text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
// ─── Approvals ─────────────────────────────
export const approvals = sqliteTable("approvals", {
  id:          text("id").primaryKey(),
  companyId:   text("company_id").notNull().references(() => companies.id),
  taskId:      text("task_id").references(() => tasks.id),
  runId:       text("run_id").references(() => runs.id),
  requestedBy: text("requested_by").notNull(),  // agent id
  reviewedBy:  text("reviewed_by"),             // user id who approved/rejected
  status:      text("status").notNull().default("pending"),
  // 'pending' | 'approved' | 'rejected'
  reason:      text("reason"),
  createdAt:   text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  resolvedAt:  text("resolved_at"),
});

// ─── Events (immutable audit log) 
export const events = sqliteTable("events", {
  id:          text("id").primaryKey(),
  companyId:   text("company_id").notNull().references(() => companies.id),
  actorType:   text("actor_type").notNull(),    // 'agent' | 'user' | 'system'
  actorId:     text("actor_id").notNull(),
  action:      text("action").notNull(),
  // e.g. 'task.checked_out' | 'run.completed' | 'budget.warning' | 'approval.requested'
  entityType:  text("entity_type"),             // 'task' | 'agent' | 'run' | ...
  entityId:    text("entity_id"),
  payloadJson: text("payload_json"),            // JSON string of event-specific data
  createdAt:   text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
