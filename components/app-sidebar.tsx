import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { 
  Store,
  CirclePlus,
  LayoutDashboard
} from "lucide-react"
import Link from "next/link"





export function AppSidebar() {
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
        <SidebarGroup>
          <Link href={'/dashboard'} className=" flex items-center gap-2">
              {/* Logo / Icon */}
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="size-5" />
              </div>
              <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
                Dashboard
              </span>
          </Link>
        </SidebarGroup>
        <SidebarGroup>
          <Link href={'/dashboard/addproducts'} className=" flex items-center gap-2">
              {/* Logo / Icon */}
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CirclePlus className="size-5" />
              </div>
              <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
                Add Product
              </span>
         </Link>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}