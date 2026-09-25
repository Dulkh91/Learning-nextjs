"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { 
  Store,
  Package,
  LayoutDashboard,
  SquarePen,
  ShoppingCart,
  SquareText
} from "lucide-react"
import Link from "next/link"

import { usePathname } from "next/navigation"


const menus = [
  {title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {title: "Products",
    url: "/dashboard/products",
    icon: Package
  },
  {title: "Sales",
    url: "/dashboard/sales",
    icon: SquareText
  },
  {title: "POS",
    url: "/pos",
    icon: ShoppingCart
  }
]


export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar className=" bg-slate-700" collapsible="icon">
      <SidebarHeader>
       <div>
          <Link href={'/pos'} className="flex items-center gap-2 py-3">
            {/* Logo / Icon */}
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-5" />
            </div>

            {/* App Name */}
            <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
              Dul Coffee 
            </span>
          </Link>
          
        </div>
      </SidebarHeader>
      
      <SidebarContent className=" bg-gray-500">
          {menus.map((menu)=>{

            const isActive = pathname === menu.url 

            return(
                  <SidebarGroup key={menu.title}>
                      <Link
                          href={menu.url}
                          className={`flex items-center p-2 gap-2 group-data-[collapsible=icon]:justify-center ${
                            isActive
                              ? "bg-primary text-primary-foreground font-bold rounded-md " // CSS ពេល Active
                              : "hover:bg-slate-600 text-slate-200 rounded-md"            // CSS ពេល Normal / Hover
                          }`}
                        >
                          {/* Logo / Icon */}
                            <div className={`flex items-center shrink-0`}>
                              <menu.icon className="size-5" />
                            </div>
                          <span className="text-lg font-bold group-data-[collapsible=icon]:hidden ">
                            {menu.title}
                          </span>
                      </Link>
                  </SidebarGroup>
            )
          })}

        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}