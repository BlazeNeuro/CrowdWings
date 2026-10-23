"use client";

import * as React from "react";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useSession } from "@/lib/auth/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  PlusCircleIcon,
  SproutIcon,
} from "lucide-react";

const navMainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon className="size-4 text-primary" />,
  },
  {
    title: "Start a Campaign",
    url: "/campaigns/create",
    icon: <PlusCircleIcon className="size-4" />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name || "Web3 Pioneer",
    email: session?.user?.email || "Connected via MetaMask",
    avatar: session?.user?.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${session?.user?.email || "user"}`,
    role: (session?.user as Record<string, any> | undefined)?.role || "investor",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2.5 font-bold text-sm text-foreground hover:text-primary transition"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <SproutIcon className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight leading-none">
                  CrowdWings
                </span>
                <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                  Decentralized Protocol
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
