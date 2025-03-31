'use client';

import { useActiveVault } from '@/context/ActiveVaultProvider';
import { useNetwork } from '@aptos-labs/react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'motion/react';
import ExpandingContainer from './ExpandingContainer';
import { useEffect, useState } from 'react';

export default function Banner() {
  const { network: activeNetwork } = useNetwork();
  const { network: vaultNetwork, isOwner } = useActiveVault();

  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsDelayed(true), 1000);
  }, []);

  const renderBanner = () => {
    if (typeof window === 'undefined' || !isDelayed) return null;

    if (activeNetwork !== vaultNetwork)
      return (
        <motion.div
          key={activeNetwork}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 pb-0"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 font-display bg-red-400/10 text-red-700 rounded-md w-full p-4">
              <div className="bg-red-400 outline-red-400 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 p-1.5 overflow-visible text-white" />
              </div>
              <p className="text-sm font-medium">
                You are connected to the wrong network, the application may not
                work as expected. Please switch to{' '}
                <span className="font-bold capitalize tracking-wider">
                  {vaultNetwork}.
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      );

    if (!isOwner)
      return (
        <motion.div
          key={activeNetwork}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 pb-0"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 font-display bg-yellow-400/10 text-yellow-700 rounded-md w-full p-4">
              <div className="bg-yellow-400 outline-yellow-400 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 p-1.5 overflow-visible text-white" />
              </div>
              <p className="text-sm font-medium">
                You are in read-only mode since you are not an owner of this
                vault.
              </p>
            </div>
          </div>
        </motion.div>
      );

    return null;
  };

  return (
    <ExpandingContainer>
      <AnimatePresence mode="wait">{renderBanner()}</AnimatePresence>
    </ExpandingContainer>
  );
}
