"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
        Platform Menu
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} className="w-full block">
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.title}
                    className="w-full gap-2.5 font-medium cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
