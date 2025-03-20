"use client";

import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { useCoins } from "@/context/CoinsProvider";
import { useActiveVault } from "@/context/ActiveVaultProvider";
import { cn, hasWindow } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { ArrowDownRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReceiveModal from "@/components/modals/ReceiveModal";
import PageVaultHeader from "@/components/PageVaultHeader";
import SendCoinsModal from "@/components/modals/SendCoinsModal";

const tabs = [
  {
    id: "coins",
    label: "Coins",
    href: "/vault/[vaultId]",
  },
  {
    id: "transactions",
    label: "Transactions",
    href: "/vault/[vaultId]/transactions",
  },
] as const;

export default function VaultLayout({ children }: PropsWithChildren) {
  const [isSendCoinsModalOpen, setIsSendCoinsModalOpen] = useState(false);

  const pathname = usePathname();

  const { totalValue, isLoading: isLoadingCoins } = useCoins();

  const { id, isOwner } = useActiveVault();

  return (
    <div className="p-8 flex flex-col h-full">
      <PageVaultHeader title="Dashboard" />

      <br />

      <div className="flex items-center justify-between">
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            {isLoadingCoins || !hasWindow() || totalValue === undefined ? (
              <motion.div
                key="portfolio-balance-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                <Skeleton key="label-skeleton" className="w-24 h-5" />
                <Skeleton key="value-skeleton" className="w-32 h-9" />
              </motion.div>
            ) : (
              <motion.div
                key="portfolio-balance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                <p className="font-display tracking-wide text-sm">
                  Total Balance
                </p>
                <p className="text-3xl font-display font-bold tracking-wide">{`$${(totalValue ?? 0).toLocaleString()}`}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isSendCoinsModalOpen}
            onOpenChange={setIsSendCoinsModalOpen}
          >
            <Button
              size="lg"
              className="px-6"
              onClick={() => setIsSendCoinsModalOpen(true)}
              disabled={!isOwner}
            >
              Send <ArrowTopRightIcon className="w-6 h-6" />
            </Button>
            <SendCoinsModal onClose={() => setIsSendCoinsModalOpen(false)} />
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="px-6" variant="outline">
                Receive <ArrowDownRightIcon className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <ReceiveModal />
          </Dialog>
        </div>
      </div>

      <br />

      <div className="flex border-b border-border-dark">
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
            >
              <VerticalCutReveal transition={{ delay: i * 0.05 }}>
                {tab.label}
              </VerticalCutReveal>
              {isActive ? (
                <motion.div
                  layoutId="underline-dashboard"
                  id="underline-dashboard"
                  transition={{ type: "spring", stiffness: 200, damping: 21 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
