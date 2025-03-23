"use client";

import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { useActiveVault } from "@/context/ActiveVaultProvider";
import { motion } from "motion/react";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import PageVaultHeader from "@/components/PageVaultHeader";

const tabs = [
  {
    id: "setup",
    label: "Setup",
    href: "/vault/[vaultId]/settings",
  },
  {
    id: "export",
    label: "Export",
    href: "/vault/[vaultId]/settings/export",
  },
] as const;

export default function VaultSettingsLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const { id } = useActiveVault();

  return (
    <div className="h-full p-8 flex flex-col">
      <PageVaultHeader title="Settings" />

      <br />

      <div className="flex border-b">
        {tabs.map((tab, i) => {
          const isActive = pathname === tab.href.replace("[vaultId]", id);
          return (
            <Link
              key={tab.id}
              href={tab.href.replace("[vaultId]", id)}
              className={cn(
                "px-4 py-2 relative font-display font-semibold tracking-wide transition-all",
                isActive
                  ? "text-primary cursor-default"
                  : "hover:opacity-80 active:opacity-60 cursor-pointer"
              )}
              data-testid={`settings-tab-item-${tab.id}`}
            >
              <VerticalCutReveal transition={{ delay: i * 0.05 }}>
                {tab.label}
              </VerticalCutReveal>
              {isActive ? (
                <motion.div
                  layoutId="underline-settings"
                  id="underline-settings"
                  transition={{ type: "spring", stiffness: 200, damping: 21 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              ) : null}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
