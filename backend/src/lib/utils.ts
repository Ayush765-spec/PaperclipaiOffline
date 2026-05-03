//this is a shared lib that assists in id generation and response helpers

import {randomUUID} from "crypto";

export const generateID=()=> randomUUID();

export const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const success=<T>(data:T)=>({success:true,data});
export const failure=(message:string,code?:string)=>({
    success:false,
    error:{message,code},
});
