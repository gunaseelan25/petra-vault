"use client";

import * as React from "react";
import { LifeBuoy, Send } from "lucide-react";

import { NavVaults } from "@/components/NavVaults";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { parseVaultId } from "@/lib/vaults";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  FilePlusIcon,
  GearIcon,
  HomeIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { NavItemGroup } from "./NavItemGroup";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const activeVaultId = useMemo(() => {
    const parts = pathname.split("/");
    if (parts[1] !== "vault" || !parts[2]) return undefined;
    const parsedVaultId = parseVaultId(parts[2]);
    return parsedVaultId ? parts[2] : undefined;
  }, [pathname]);

  const data = useMemo(() => {
    return {
      actions: [
        {
          name: "Home",
          url: activeVaultId ? `/vault/${activeVaultId}` : undefined,
          activePaths: [
            `/vault/${activeVaultId}`,
            `/vault/${activeVaultId}/transactions`,
          ],
          icon: HomeIcon,
        },
        {
          name: "Create Proposal",
          url: activeVaultId
            ? `/vault/${activeVaultId}/proposal/create`
            : undefined,
          icon: Pencil1Icon,
        },
        {
          name: "Publish Contract",
          url: activeVaultId
            ? `/vault/${activeVaultId}/proposal/publish-contract`
            : undefined,
          icon: FilePlusIcon,
        },
      ],

      management: [
        {
          name: "Settings",
          url: activeVaultId ? `/vault/${activeVaultId}/settings` : undefined,
          icon: GearIcon,
        },
      ],

      secondary: [
        // {
        //   name: "Support",
        //   url: "https://github.com/aptos-labs/petra-wallet",
        //   icon: LifeBuoy,
        //   target: "_blank",
        //   size: "sm",
        // },
        {
          name: "Feedback",
          url: "https://github.com/aptos-labs/petra-wallet",
          icon: Send,
          size: "sm",
          target: "_blank",
        },
      ],
    };
  }, [activeVaultId]);

  return (
    <Sidebar
      className="top-[var(--header-height)] !h-[calc(100svh-var(--header-height))] py-2 px-1 pl-2 font-display"
      variant="sidebar"
      {...props}
    >
      <SidebarHeader>
        <NavVaults />
      </SidebarHeader>
      <SidebarContent>
        {activeVaultId && (
          <>
            <NavItemGroup title="Platform" items={data.actions} />
            <NavItemGroup title="Management" items={data.management} />
          </>
        )}
        <NavItemGroup items={data.secondary} className="mt-auto" size="sm" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
