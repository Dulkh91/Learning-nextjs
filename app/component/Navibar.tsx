"use client"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const items = [
    {title: 'Products',
     url: '/dashboard/products'
    },
    {title: 'Add Products',
     url: '/dashboard/products/addproducts'
    },
    {title: 'Change Products',
     url: '/dashboard/products/updateproducts'
    },
]


export default function Navbar(){
    const pathname = usePathname()
    const router = useRouter()

     const handlePath = (url: string)=>{
            if(url !== pathname){
               router.push(url)
            }
  
     }

    return(
        <Tabs className={"w-full my-3  items-center "} value={pathname}>
            <TabsList className={" bg-cyan-500"}>
                {items.map((m)=>(
                        <TabsTrigger value={m.url} key={m.title} onClick={()=>handlePath(m.url)} className={" p-3"}>
                            {m.title}
                        </TabsTrigger>
                ))}
                
            </TabsList>
        </Tabs>
    )
    
}