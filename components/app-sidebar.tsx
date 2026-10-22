"use client";

import * as React from "react";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useSession } from "@/lib/auth/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  CompassIcon,
  RocketIcon,
  ShieldCheckIcon,
  CoinsIcon,
  Settings2Icon,
  SparklesIcon,
} from "lucide-react";

const navMainItems = [
  {
    title: "Dashboard Overview",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Explore Campaigns",
    url: "/campaigns",
    icon: <CompassIcon />,
  },
  {
    title: "Launch Project",
    url: "/campaigns/create",
    icon: <RocketIcon />,
  },
  {
    title: "Milestone Escrow",
    url: "/dashboard",
    icon: <ShieldCheckIcon />,
  },
];

const navSecondaryItems = [
  {
    title: "Settings & Wallet",
    url: "/dashboard",
    icon: <Settings2Icon />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name || "Web3 Pioneer",
    email: session?.user?.email || "Connected via MetaMask",
    avatar: session?.user?.image || "https://api.dicebear.com/7.x/identicon/svg?seed=user",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="flex items-center gap-2 px-2 py-2 font-bold text-sm text-foreground hover:text-primary transition">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <SparklesIcon className="size-4" />
              </div>
              <span className="text-base font-bold tracking-tight">
                CrowdWings
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
