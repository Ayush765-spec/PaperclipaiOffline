import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import {config} from "dotenv"

config();

const server=Fastify({
    logger:{
        transport:{
            target:"pino-pretty",
            options:{colorize:true},
        },
    },
});

//Plugins

await server.register(cors,{
    origin:process.env["FRONTEND_URL"]??"https://localhost:5173",
    credentials:true,
});
await server.register(jwt,{
    secret:process.env["JWT_SECRET"] ?? "has to be changed in production"

});
await server.register(websocket);

//--Health check
server.get("/health",async()=>{
    return{status:"ok",timestamp:new Date().toISOString()};

});
//Start
try{
    await server.listen({port:3000,host:"0.0.0.0"});
    console.log("Server running at http://localhost:3000");

}catch(err){
    server.log.error(err);
    process.exit(1);
}
