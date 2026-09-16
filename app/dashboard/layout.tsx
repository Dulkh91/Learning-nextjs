import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"



export default function dashboardLayout({children}:{children:React.ReactNode}){
    return(
        <SidebarProvider className=" bg-slate-500">
           <AppSidebar/>
                <main className=" flex-1 min-w-0">
                    <SidebarTrigger />
                    {children}
               </main>                     
        </SidebarProvider>
    )
}