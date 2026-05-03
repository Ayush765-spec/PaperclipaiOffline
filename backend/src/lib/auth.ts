import type {FastifyRequest,FastifyReply} from "fastify";

export async function requireAuth(
    request:FastifyRequest,
    reply:FastifyReply,

){
    try{
        await request.jwtVerify();
    }catch{
        await reply.status(401).send({error:"Unauthorized"});
    }
}
export interface JwtPayLoad{
    userId:string;
    companyId:string;
    role:string;
}