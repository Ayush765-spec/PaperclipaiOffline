const BASE="/api";

function getToken(){
    return localStorage.getItem("token");

}
async function request<T>(
    path:string,
    options:RequestInit={}
):Promise<T>{
    const res=await fetch(`${BASE}${path}`,{
        ...options,
        headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${getToken()}`,
            ...options.headers,
        },
    });
    if(!res.ok){
        const err=await res.json().catch(()=> ({}));
        throw new Error(err.error?.message ?? `Request failed :${res.status}`);

    }
    const data =await res.json();
    return data.data as T;

}
//--Types
export interface Agent{
    id:string;
    companyId:string;
    name:string;
    role:string;
    title:string;
    model:string;
    status:string;
    monthlyTokenLimit:number;
    lastHeartbeatAt:string|null;
    parentAgentId:string|null;
    systemPrompt:string;
    createdAt:string;
}

export interface Task{
    id:string;
    companyId:string;
    agentId:string;
    title:string;
    description:string;
    status:string;
    priority:number;
    createdAt:string;
    completedAt:string|null;
}
export interface Budget{
    id:string;
    agentId:string;
    month:string;
    tokensUsed:number;
    tokensLimit:number;
    hardStop:boolean;
}
export interface Company{
    id:string;
    name:string;
    mission:string;
    createdAt:string;
}
//auth
export const authApi={
    login:(email:string, password:string)=>
        request<{token:string;userId:string;companyId:string}>(
            "/auth/login",
            {
                method:"POST",
                body:JSON.stringify({email,password}),
            }
        ),
};
//companies
export const companiesApi={
    get:(companyId:string)=>
        request<Company>(`/companies/${companyId}`),
};
//Agents
export const agentsApi={
    list:(companyId:string)=>
        request<Agent[]>(`/companies/${companyId}/agents`),
    create:(
        companyId:string,
        data:{
            name:string;
            role:string;
            model:string;
            systemPrompt:string;
            monthlyTokenLimit:number;
        }
    )=>
        request<Agent>(`/companies/${companyId}/agents`,{
            method:"POST",
            body:JSON.stringify(data),
        }),
    getBudget:(agentId:string)=>
        request<Budget>(`/agents/${agentId}/budget`),
};
//--Tasks
export const tasksApi={
    list:(companyId:string,status?:string)=>
        request<Task[]>(
            `/companies/${companyId}/tasks${status ? `?status=${status}`:""}`
        ),
    create:(
        companyId:string,
        data:{
            agentId:string;
            title:string;
            description:string;
            priority:number;
        }
    )=>
        request<Task>(`/companies/${companyId}/tasks`,{
            method:"POST",
            body:JSON.stringify(data),
        }),
    updateStatus:(taskId:string,status:string)=>
        request(`/tasks/${taskId}/status`,{
            method:"PATCH",
            body:JSON.stringify({status}),
        }),
};