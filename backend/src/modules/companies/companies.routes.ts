import type{FastifyInstance} from "fastify";
import {db} from "../../db/index.js";
import {companies,users} from "../../db/schema.js";
import {generateID,success,failure} from "../../lib/utils.js";
import{requireAuth} from "../../lib/auth.js";
import {z} from "zod";
import bcrypt from "bcryptjs";
import{eq} from "drizzle-orm";

const CreateCompanySchema=z.object({
    name:z.string().min(1),
    mission:z.string().default(""),
    ownerEmail:z.string().email(),
    ownerPassword:z.string().min(6),
});
const LoginSchema=z.object({
    email:z.string().email(),
    password:z.string(),
});
export async function companiesRoutes(app:FastifyInstance){
    app.post("/api/companies",async(request,reply)=>{
        const body=CreateCompanySchema.safeParse(request.body);
        if(!body.success){
            return reply.status(400).send(failure("Invalid request body "));

        }
        const {name,mission,ownerEmail,ownerPassword}=body.data;
        const companyId=generateID();
        const userId=generateID();
        const passwordHash=await bcrypt.hash(ownerPassword,10);

        await db.insert(companies).values({
            id:companyId,
            name,
            mission,
        });
        await db.insert(users).values({
            id:userId,
            companyId,
            email:ownerEmail,
            passwordHash,
            role:"owner",
        });
        return reply.status(201).send(
            success({companyId,userId,name})
        );
    });
    //POST /api/auth/login

    app.post("/api/auth/login",async(request,reply)=>{
        const body=LoginSchema.safeParse(request.body);
        if(!body.success){
            return reply.status(400).send(failure("INvalid request body"));
        }
        const{email,password}=body.data;
        const user=await db.query.users.findFirst({
            where :eq(users.email,email),
        });
        if(!user){
            return reply.status(401).send(failure("Invalid credentials"));

        }
        const valid=await bcrypt.compare(password,user.passwordHash);
        if(!valid){
            return reply.status(401).send(failure("INvalid credentials"));

        }
        const token = app.jwt.sign({
            userId: user.id,
            companyId: user.companyId,
            role: user.role,
        });
        return reply.send(success({ token, userId: user.id, companyId: user.companyId }));
    });

    // GET /api/companies/:id
    app.get(
        "/api/companies/:id",
        { preHandler: requireAuth },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const company = await db.query.companies.findFirst({
                where: eq(companies.id, id),
            });
            if (!company) {
                return reply.status(404).send(failure("Company not found"));
            }
            return reply.send(success(company));
        }
    );
}
