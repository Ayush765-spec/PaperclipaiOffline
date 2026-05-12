import {create} from "zustand";

interface AuthState{
    token:string|null;
    userId:string|null;
    companyId:string|null;
    isAuthenticated:boolean;
    login:(token:string,userId:string,companyId:string)=>void;
    logout:()=>void;
}
export const useAuthStore=create<AuthState>((set)=>({
    token: localStorage.getItem("token"),
    userId:localStorage.getItem("userId"),
    companyId:   localStorage.getItem("companyId"),
    isAuthenticated: !!localStorage.getItem("token"),

    login:(token,userId,companyId)=>{
        localStorage.setItem("token",token);
        localStorage.setItem("userId",userId);
        localStorage.setItem("companyId",companyId);
        set({token,userId,companyId,isAuthenticated:true});
    },
    logout:()=>{
        localStorage.clear();
        set({token:null,userId:null,companyId:null,isAuthenticated:false});
    },
}));