import type { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import { tasks, events } from "../../db/schema.js";
import { generateID, success, failure } from "../../lib/utils.js";
import { requireAuth } from "../../lib/auth.js";
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";

const CreateTaskSchema = z.object({
  agentId: z.string(),
  goalId: z.string().optional(),
  parentTaskId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().default(""),
  priority: z.number().default(0),
  dueAt: z.string().optional(),
});

export async function tasksRoutes(app: FastifyInstance) {
  // GET /api/companies/:companyId/tasks
  app.get(
    "/api/companies/:companyId/tasks",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      const { status } = request.query as { status?: string };

      const allTasks = await db.query.tasks.findMany({
        where: status
          ? and(eq(tasks.companyId, companyId), eq(tasks.status, status))
          : eq(tasks.companyId, companyId),
      });

      return reply.send(success(allTasks));
    }
  );

  // POST /api/companies/:companyId/tasks
  app.post(
    "/api/companies/:companyId/tasks",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      const body = CreateTaskSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send(failure("Invalid request body"));
      }

      const taskId = generateID();

      await db.insert(tasks).values({
        id: taskId,
        companyId,
        ...body.data,
      });

      // Emit event
      await db.insert(events).values({
        id: generateID(),
        companyId,
        actorType: "user",
        actorId: "system",
        action: "task.created",
        entityType: "task",
        entityId: taskId,
      });

      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
      });

      return reply.status(201).send(success(task));
    }
  );

  // POST /api/tasks/:id/checkout — atomic checkout (the critical one)
  app.post(
    "/api/tasks/:id/checkout",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { runId } = request.body as { runId: string };

      // This is the atomic operation — only succeeds if task is unlocked
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
            eq(tasks.id, id),
            eq(tasks.status, "todo"),
            isNull(tasks.lockedByRunId)
          )
        )
        .run();

      if (result.changes === 0) {
        return reply
          .status(409)
          .send(failure("Task already checked out or not available", "ALREADY_LOCKED"));
      }

      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
      });

      return reply.send(success(task));
    }
  );

  // POST /api/tasks/:id/complete
  app.post(
    "/api/tasks/:id/complete",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      await db
        .update(tasks)
        .set({
          status: "done",
          lockedByRunId: null,
          lockedAt: null,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasks.id, id));

      return reply.send(success({ id, status: "done" }));
    }
  );

  // PATCH /api/tasks/:id/status
  app.patch(
    "/api/tasks/:id/status",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      await db
        .update(tasks)
        .set({ status, updatedAt: new Date().toISOString() })
        .where(eq(tasks.id, id));

      return reply.send(success({ id, status }));
    }
  );
}