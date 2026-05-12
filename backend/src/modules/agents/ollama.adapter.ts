import { db } from "../../db/index.js";
import { runs, runMessages, budgets, tasks, events } from "../../db/schema.js";
import { generateID, getCurrentMonth } from "../../lib/utils.js";
import { eq, and } from "drizzle-orm";

// ─── Tool definitions sent to Ollama ─────────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path to read" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Write content to a file",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path to write" },
          content: { type: "string", description: "Content to write" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files in a directory",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mark_task_done",
      description: "Mark the current task as completed with a summary",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "What was accomplished" },
        },
        required: ["summary"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_subtask",
      description: "Create a subtask for another agent to handle",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          agentId: { type: "string", description: "Agent ID to assign the subtask to" },
        },
        required: ["title", "description", "agentId"],
      },
    },
  },
] as const;

// ─── Tool executor ────────────────────────────────────────────────────────────
async function executeTool(
  name: string,
  args: Record<string, string>,
  context: { taskId: string; companyId: string }
): Promise<string> {
  const { readFile, writeFile, readdir } = await import("fs/promises");

  switch (name) {
    case "read_file": {
      try {
        const content = await readFile(args["path"] ?? "", "utf-8");
        return content;
      } catch {
        return `Error: Could not read file at ${args["path"]}`;
      }
    }

    case "write_file": {
      try {
        const { dirname } = await import("path");
        const { mkdir } = await import("fs/promises");
        await mkdir(dirname(args["path"] ?? ""), { recursive: true });
        await writeFile(args["path"] ?? "", args["content"] ?? "", "utf-8");
        return `Successfully wrote to ${args["path"]}`;
      } catch (e) {
        return `Error writing file: ${String(e)}`;
      }
    }

    case "list_files": {
      try {
        const files = await readdir(args["path"] ?? ".", { withFileTypes: true });
        return files
          .map((f) => `${f.isDirectory() ? "[dir]" : "[file]"} ${f.name}`)
          .join("\n");
      } catch {
        return `Error: Could not list directory ${args["path"]}`;
      }
    }

    case "mark_task_done": {
      await db
        .update(tasks)
        .set({
          status: "done",
          lockedByRunId: null,
          lockedAt: null,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasks.id, context.taskId));

      return `Task marked as done. Summary: ${args["summary"]}`;
    }

    case "create_subtask": {
      const subtaskId = generateID();
      await db.insert(tasks).values({
        id: subtaskId,
        companyId: context.companyId,
        agentId: args["agentId"] ?? "",
        parentTaskId: context.taskId,
        title: args["title"] ?? "",
        description: args["description"] ?? "",
        status: "todo",
      });
      return `Subtask created with id: ${subtaskId}`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── Main agent runner ────────────────────────────────────────────────────────
export async function runAgentOnTask(
  agent: {
    id: string;
    name: string;
    role: string;
    model: string;
    ollamaBaseUrl: string;
    systemPrompt: string;
    companyId: string;
  },
  task: {
    id: string;
    title: string;
    description: string;
    companyId: string;
  }
) {
  const runId = generateID();

  // Create run record
  await db.insert(runs).values({
    id: runId,
    taskId: task.id,
    agentId: agent.id,
    status: "running",
    model: agent.model,
  });

  const systemPrompt = `You are ${agent.name}, a ${agent.role} at this company.

${agent.systemPrompt}

Your current task: ${task.title}
Task description: ${task.description}

Use the available tools to complete your task. When done, call mark_task_done with a summary of what you accomplished.
Be concise and focused. Only do what the task requires.`;

  const messages: Array<{
    role: string;
    content: string;
    tool_call_id?: string;
    tool_calls?: unknown[];
  }> = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Please complete this task: ${task.title}` },
  ];

  // Save initial messages
  await db.insert(runMessages).values([
    {
      id: generateID(),
      runId,
      role: "system",
      content: systemPrompt,
    },
    {
      id: generateID(),
      runId,
      role: "user",
      content: `Please complete this task: ${task.title}`,
    },
  ]);

  let totalTokens = 0;
  let taskDone = false;
  const MAX_ITERATIONS = 10; // prevent infinite loops
  let iterations = 0;

  try {
    // ─── Tool call loop ───────────────────────────────────────────────────────
    while (!taskDone && iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await fetch(
        `${agent.ollamaBaseUrl}/v1/chat/completions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: agent.model,
            messages,
            tools: TOOLS,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
      }

      const data = (await response.json()) as {
        choices: Array<{
          message: {
            role: string;
            content: string | null;
            tool_calls?: Array<{
              id: string;
              function: { name: string; arguments: string };
            }>;
          };
          finish_reason: string;
        }>;
        usage?: { total_tokens: number };
      };

      const choice = data.choices[0];
      if (!choice) break;

      const assistantMessage = choice.message;
      totalTokens += data.usage?.total_tokens ?? 0;

      // Save assistant message
      await db.insert(runMessages).values({
        id: generateID(),
        runId,
        role: "assistant",
        content: assistantMessage.content ?? "",
      });

      messages.push({
        role: "assistant",
        content: assistantMessage.content ?? "",
        tool_calls: assistantMessage.tool_calls as unknown[],
      });

      // No tool calls — check if model returned them as JSON in content
      let toolCalls = assistantMessage.tool_calls ?? [];

      if (!toolCalls.length && assistantMessage.content) {
        // Try to parse content as JSON tool call
        try {
          const parsed = JSON.parse(assistantMessage.content.trim());
          if (parsed && parsed.name && parsed.arguments) {
            toolCalls = [{
              id: generateID(),
              function: {
                name: String(parsed.name),
                arguments: typeof parsed.arguments === 'string'
                  ? parsed.arguments
                  : JSON.stringify(parsed.arguments)
              }
            }];
            assistantMessage.content = null;
          }
        } catch {
          // Not JSON, it's just regular text content
        }
      }

      if (!toolCalls.length) {
        taskDone = true;
        break;
      }

      // Execute each tool call
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, string>;

        console.log(`[Agent ${agent.name}] calling tool: ${toolName}`, toolArgs);

        const toolResult = await executeTool(toolName, toolArgs, {
          taskId: task.id,
          companyId: task.companyId,
        });

        if (toolName === "mark_task_done") taskDone = true;

        // Save tool result message
        await db.insert(runMessages).values({
          id: generateID(),
          runId,
          role: "tool",
          content: toolResult,
          toolCallId: toolCall.id,
        });

        messages.push({
          role: "tool",
          content: toolResult,
          tool_call_id: toolCall.id,
        });
      }
    }

    // ─── Update run as completed ──────────────────────────────────────────────
    await db
      .update(runs)
      .set({
        status: "completed",
        totalTokens,
        finishedAt: new Date().toISOString(),
        output: messages[messages.length - 1]?.content ?? "",
      })
      .where(eq(runs.id, runId));

    // ─── Update budget ────────────────────────────────────────────────────────
    const budget = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.agentId, agent.id),
        eq(budgets.month, getCurrentMonth())
      ),
    });

    if (budget) {
      await db
        .update(budgets)
        .set({ tokensUsed: budget.tokensUsed + totalTokens })
        .where(eq(budgets.id, budget.id));
    }

    // ─── Emit completion event ────────────────────────────────────────────────
    await db.insert(events).values({
      id: generateID(),
      companyId: agent.companyId,
      actorType: "agent",
      actorId: agent.id,
      action: "run.completed",
      entityType: "run",
      entityId: runId,
      payloadJson: JSON.stringify({ tokensUsed: totalTokens, taskId: task.id }),
    });

    console.log(
      `[Agent ${agent.name}] run ${runId} completed. Tokens used: ${totalTokens}`
    );

    return { runId, status: "completed", totalTokens };
  } catch (error) {
    // ─── Mark run as failed ───────────────────────────────────────────────────
    await db
      .update(runs)
      .set({
        status: "failed",
        error: String(error),
        finishedAt: new Date().toISOString(),
      })
      .where(eq(runs.id, runId));

    console.error(`[Agent ${agent.name}] run ${runId} failed:`, error);
    return { runId, status: "failed", totalTokens };
  }
}