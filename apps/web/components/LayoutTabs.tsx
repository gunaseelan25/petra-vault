'use client';

import { useActiveVault } from '@/context/ActiveVaultProvider';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import VerticalCutReveal from './ui/vertical-cut-reveal';

interface LayoutTabsProps {
  layoutId: string;
  tabs: { id: string; label: string; href: string }[];
}

export default function LayoutTabs({ layoutId, tabs }: LayoutTabsProps) {
  const pathname = usePathname();

  const { id } = useActiveVault();

  return (
    <div className="flex border-b border-border-dark">
      {tabs.map((tab, i) => {
        const isActive = pathname === tab.href.replace('[vaultId]', id);
        return (
          <Link
            key={tab.id}
            href={tab.href.replace('[vaultId]', id)}
            className={cn(
              'px-4 py-2 flex-1 md:flex-none relative flex items-center justify-center font-display font-semibold tracking-wide transition-all',
              isActive
                ? 'text-primary cursor-default'
                : 'hover:opacity-80 active:opacity-60 cursor-pointer'
            )}
            data-testid={`${layoutId}-tab-item-${tab.id}`}
          >
            <VerticalCutReveal transition={{ delay: i * 0.05 }}>
              {tab.label}
            </VerticalCutReveal>
            {isActive ? (
              <motion.div
                layoutId={`underline-${layoutId}`}
                id={`underline-${layoutId}`}
                transition={{ type: 'spring', stiffness: 200, damping: 21 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
