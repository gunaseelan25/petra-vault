"use client";

import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import VaultImportNameForm from "@/components/forms/VaultImportNameForm";
import { useOnboarding } from "@/context/OnboardingProvider";
import useMultisigOwners from "@/hooks/useMultisigOwners";
import { Label } from "./ui/label";
import { AptosAvatar } from "aptos-avatars-react";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";
import useMultisigSignaturesRequired from "@/hooks/useMultisigSignaturesRequired";
import { toast } from "sonner";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import { useNetwork } from "@aptos-labs/react";

export default function OnboardingImportSetName() {
  const { importVaultAddress, importVault } = useOnboarding();
  const network = useNetwork();

  const { data: owners } = useMultisigOwners({
    address: importVaultAddress.current,
  });

  const { data: signaturesRequired } = useMultisigSignaturesRequired({
    address: importVaultAddress.current,
  });

  if (!importVaultAddress.current) {
    return <div>No vault address found</div>;
  }

  return (
    <motion.div
      key="set-name"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 200,
        damping: 21,
      }}
    >
      <Card className="w-full max-w-md">
        <CardContent>
          <VaultImportNameForm
            address={importVaultAddress.current}
            onSubmit={(e) => {
              if (!owners || !signaturesRequired) {
                toast.error("Failed to fetch owners or signatures required");
                return;
              }

              importVault({
                type: "framework",
                name: e.name,
                signers: owners.map((e, i) => ({
                  address: AccountAddress.from(e),
                  name: `Owner ${i + 1}`,
                })),
                signaturesRequired,
                address: AccountAddress.from(importVaultAddress.current),
                network: network.network,
              });
            }}
          >
            <div>
              <Label>Owners</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {owners?.map((e) => (
                  <div
                    key={e.toString()}
                    className="flex items-center gap-2 mt-2"
                  >
                    <AptosAvatar value={e.toString()} size={20} />
                    <p className="font-display text-sm font-medium ml-1">
                      {truncateAddress(e.toString())}
                    </p>
                  </div>
                ))}
              </div>
              <br />
              <Label>Signatures Required</Label>
              <div className="text-muted-foreground text-sm mt-4">
                <span className="font-display text-foreground font-semibold">
                  Requires {signaturesRequired} of {owners?.length} owners
                </span>{" "}
                to execute a transaction.
              </div>
            </div>
          </VaultImportNameForm>
        </CardContent>
      </Card>
    </motion.div>
  );
}
