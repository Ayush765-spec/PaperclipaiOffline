import type{FastifyInstance} from "fastify";
import {db} from "../../db/index.js";
import {agents,budgets} from "../../db/schema.js";
import {generateID,success,failure,getCurrentMonth} from "../../lib/utils.js";
import {requireAuth} from "../../lib/auth.js";
import {z} from "zod";
import {eq,and} from "drizzle-orm";

const CreateAgentSchema=z.object({
    name:z.string().min(1),
    role:z.string().min(1),
    title:z.string().default(""),
    systemPrompt:z.string().default(""),
    model:z.string().default("llama3:latest"),
    monthlyTokenLimit:z.number().default(100000),
    parentAgentId:z.string().optional(),
    heartBeatIntervalMs:z.number().default(60000),
});

export async function agentsRoutes(app:FastifyInstance){
    // GET /api/companies/:companyId/agents
    app.get(
        "/api/companies/:companyId/agents",
        { preHandler: requireAuth },
        async (request, reply) => {
            const { companyId } = request.params as { companyId: string };

            const allAgents = await db.query.agents.findMany({
                where: eq(agents.companyId, companyId),
            });
            return reply.send(success(allAgents));
        }
    );

    // POST /api/companies/:companyId/agents
    app.post(
        "/api/companies/:companyId/agents",
        { preHandler: requireAuth },
        async (request, reply) => {
            const { companyId } = request.params as { companyId: string };
            const body = CreateAgentSchema.safeParse(request.body);

            if (!body.success) {
                return reply.status(400).send(failure("Invalid request body"));
            }

            const agentId = generateID();
            await db.insert(agents).values({
                id: agentId,
                companyId,
                ...body.data,
            });

            await db.insert(budgets).values({
                id: generateID(),
                agentId,
                companyId,
                month: getCurrentMonth(),
                tokensUsed: 0,
                tokensLimit: body.data.monthlyTokenLimit,
            });

            const agent = await db.query.agents.findFirst({
                where: eq(agents.id, agentId),
            });
            return reply.status(201).send(success(agent));
        }
    );

    // GET /api/agents/:id
    app.get(
        "/api/agents/:id",
        { preHandler: requireAuth },
        async (request, reply) => {
            const { id } = request.params as { id: string };

            const agent = await db.query.agents.findFirst({
                where: eq(agents.id, id),
            });
            if (!agent) return reply.status(404).send(failure("Agent not found"));
            return reply.send(success(agent));
        }
    );

    // PATCH /api/agents/:id
    app.patch(
        "/api/agents/:id",
        { preHandler: requireAuth },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const body = CreateAgentSchema.partial().safeParse(request.body);

            if (!body.success) {
                return reply.status(400).send(failure("Invalid request body"));
            }

            await db
                .update(agents)
                .set({ ...body.data, updatedAt: new Date().toISOString() })
                .where(eq(agents.id, id));

            const agent = await db.query.agents.findFirst({
                where: eq(agents.id, id),
            });
            return reply.send(success(agent));
        }
    );

    // GET /api/agents/:id/budget
    app.get(
        "/api/agents/:id/budget",
        { preHandler: requireAuth },
        async (request, reply) => {
            const { id } = request.params as { id: string };

            const budget = await db.query.budgets.findFirst({
                where: and(
                    eq(budgets.agentId, id),
                    eq(budgets.month, getCurrentMonth())
                ),
            });
            if (!budget) return reply.status(404).send(failure("Budget not found"));
            return reply.send(success(budget));
        }
    );
}
