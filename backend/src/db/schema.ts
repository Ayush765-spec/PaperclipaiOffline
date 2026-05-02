import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";


//--Companies--
export const companies=sqliteTable("companies",{
    id:         text("id").primaryKey(),
    name:       text("name").notNull(),
    mission:    text("mission").notNull().default(""),
    createdAt:  text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt:  text("updated_at").notNull().default(sql`(datetime('now'))`),
});

//---Users---
export const users=sqliteTable("users",{
    id:             text("id").primaryKey(),
    companyId:      text("company_id").notNull().references(()=>companies.id),
    email:          text("email").notNull().unique(),
    passwordHash:   text("password_hash").notNull(),
    role:           text("role").notNull().default("member"),
    createdAt:      text("created_at").notNull().default(sql`(datetime('now'))`),
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
    createdAt:          text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt:          text("updated_at").notNull().default(sql`(datetime('now'))`),
});
//Goals(goal hierarchy--tasks track back to these)---
export const goals=sqliteTable("goals",{
    id:             text("id").primaryKey(),
    companyId:      text("company_id").notNull().references(()=> companies.id),
    parentGoalId:   text("parent_goal_id"),
    title:          text("title").notNull(),
    description:    text("description").notNull().default(""),
    status:         text("status").notNull().default("active"),
    createdAt:      text("created_at").notNull().default(sql`(datetime(now))`),
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
    createdAt:          text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt:          text("updated_at").notNull().default(sql`(datetime('now'))`),
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
    startedAt:      text("started_at").notNull().default(sql`(datetime(now))`),
    finishedAt:     text("finished_at"),
});