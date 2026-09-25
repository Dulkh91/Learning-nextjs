import React from "react";
import Navbar from "@/app/component/Navibar";


export default function layoutProduct({children}:{children:React.ReactNode}){
    return(
        <div>
            <Navbar/>
            {children}
        </div>
    )       
}