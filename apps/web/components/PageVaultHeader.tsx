import { AptosAvatar } from 'aptos-avatars-react';
import { truncateAddress } from '@aptos-labs/wallet-adapter-react';

import VerticalCutReveal from './ui/vertical-cut-reveal';
import { useActiveVault } from '@/context/ActiveVaultProvider';
import { motion } from 'motion/react';
import { CopyIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { getExplorerUrl } from '@aptos-labs/js-pro';

interface PageVaultHeaderProps {
  title: string;
}

export default function PageVaultHeader({ title }: PageVaultHeaderProps) {
  const { vault, vaultAddress, network } = useActiveVault();

  return (
    <div className="flex items-center justify-between">
      <div className="tracking-wide">
        <VerticalCutReveal containerClassName="text-lg md:text-xl font-bold font-display">
          {title}
        </VerticalCutReveal>
        <div className="flex items-center gap-2 text-muted-foreground">
          <h2
            className="hover:text-muted-foreground/80 text-sm flex items-center gap-2 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(vaultAddress.toString());
              toast.success('Address copied to clipboard!');
            }}
            data-testid="vault-address"
          >
            <VerticalCutReveal splitBy="words">
              {`${vault?.name ?? ''} (${truncateAddress(vaultAddress)})`}
            </VerticalCutReveal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.8 }}
            >
              <CopyIcon />
            </motion.div>
          </h2>
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.8 }}
            href={getExplorerUrl({
              network: network,
              path: `account/${vaultAddress.toString()}`
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1"
          >
            <ExternalLinkIcon />
          </motion.a>
        </div>
      </div>
      <motion.div className="w-12 h-12">
        <AptosAvatar value={vaultAddress.toString()} size={48} />
      </motion.div>
    </div>
  );
}
