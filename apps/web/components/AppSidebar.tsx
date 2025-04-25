'use client';

import * as React from 'react';
import { FileCode, Send } from 'lucide-react';

import { NavVaults } from '@/components/NavVaults';
import { NavUser } from '@/components/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/components/ui/sidebar';
import { parseVaultId } from '@/lib/vaults';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  GearIcon,
  GlobeIcon,
  HomeIcon,
  Pencil1Icon,
  CubeIcon,
  ReaderIcon,
  InfoCircledIcon,
  AvatarIcon
} from '@radix-ui/react-icons';
import { NavItemGroup } from './NavItemGroup';
import { getExplorerUrl } from '@aptos-labs/js-pro';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const activeVaultId = useMemo(() => {
    const parts = pathname.split('/');
    if (parts[1] !== 'vault' || !parts[2]) return undefined;
    const parsedVaultId = parseVaultId(parts[2]);
    return parsedVaultId ? parts[2] : undefined;
  }, [pathname]);

  const data = useMemo(() => {
    return {
      actions: [
        {
          name: 'Dashboard',
          url: activeVaultId ? `/vault/${activeVaultId}` : undefined,
          activePaths: [
            `/vault/${activeVaultId}`,
            `/vault/${activeVaultId}/transactions`
          ],
          icon: HomeIcon
        },
        {
          name: 'Proposals',
          url: activeVaultId
            ? `/vault/${activeVaultId}/proposal/create`
            : undefined,
          icon: Pencil1Icon
        },
        {
          name: 'Smart Contracts',
          url: activeVaultId
            ? `/vault/${activeVaultId}/proposal/publish-contract`
            : undefined,
          icon: FileCode
        },
        ...(process.env.NEXT_PUBLIC_ENABLE_EMBEDDED === '1'
          ? [
              {
                name: 'Apps',
                url: activeVaultId
                  ? `/vault/${activeVaultId}/explore`
                  : undefined,
                activePaths: [
                  `/vault/${activeVaultId}/explore`,
                  `/vault/${activeVaultId}/explore/embedded`
                ],
                icon: CubeIcon
              }
            ]
          : [])
      ],

      management: [
        {
          name: 'View in Explorer',
          url: activeVaultId
            ? getExplorerUrl({
                network: parseVaultId(activeVaultId)?.network,
                path: `account/${parseVaultId(activeVaultId)?.address.toString()}`
              })
            : undefined,
          icon: GlobeIcon,
          target: '_blank'
        },
        {
          name: 'Documentation',
          url: 'https://petra.app/vault',
          icon: ReaderIcon,
          target: '_blank',
          size: 'sm'
        },
        {
          name: 'Settings',
          url: activeVaultId ? `/vault/${activeVaultId}/settings` : undefined,
          icon: GearIcon,
          activePaths: [
            `/vault/${activeVaultId}/settings`,
            `/vault/${activeVaultId}/settings/export`
          ]
        }
      ],

      secondary: [
        {
          name: 'Feedback',
          url: 'https://github.com/aptos-labs/petra-vault/issues',
          icon: Send,
          size: 'sm',
          target: '_blank'
        },
        {
          name: 'Terms of Service',
          url: 'https://aptoslabs.com/terms-wallet',
          icon: InfoCircledIcon,
          size: 'sm',
          target: '_blank'
        },
        {
          name: 'Privacy Policy',
          url: 'https://aptoslabs.com/privacy',
          icon: AvatarIcon,
          size: 'sm',
          target: '_blank'
        }
      ]
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
