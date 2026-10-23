"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/auth-client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  EllipsisVerticalIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  LogOutIcon,
} from "lucide-react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem("crowdwings_user_role");
      }
      router.push("/login");
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted cursor-pointer" />
            }
          >
            <Avatar className="size-8 rounded-xl border border-border">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-xl font-bold text-xs bg-primary text-primary-foreground">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">{user.name}</span>
              <span className="truncate text-[11px] text-muted-foreground capitalize">
                {user.role ? `${user.role} • ${user.email}` : user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-xl border border-border shadow-xl p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex items-center gap-2.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg text-xs font-bold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-foreground">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/dashboard" className="w-full">
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <LayoutDashboardIcon className="size-4 text-primary" />
                  Dashboard
                </DropdownMenuItem>
              </Link>
              <Link href="/campaigns/create" className="w-full">
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <PlusCircleIcon className="size-4" />
                  Start a Campaign
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive gap-2 font-medium"
            >
              <LogOutIcon className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
