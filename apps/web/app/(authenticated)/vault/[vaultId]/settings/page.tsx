"use client";

import AddOwnerModal from "@/components/modals/AddOwnerModal";
import RemoveOwnerModal from "@/components/modals/RemoveOwnerModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveVault } from "@/context/ActiveVaultProvider";
import { useVaults } from "@/context/useVaults";
import { getExplorerUrl } from "@aptos-labs/js-pro";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";
import { ExternalLinkIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { AptosAvatar } from "aptos-avatars-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import useAnalytics from "@/hooks/useAnalytics";

export default function VaultSettingsPage() {
  const trackEvent = useAnalytics();

  const router = useRouter();

  // This is a patch to reset the modal's state when it is closed.
  const [uniqueAddOwnerModalKey, setUniqueAddOwnerModalKey] = useState<number>(
    Math.random()
  );

  const { deleteVault } = useVaults();
  const { network, owners, vaultAddress, signaturesRequired, isOwner } =
    useActiveVault();

  return (
    <div className="py-6 flex flex-col gap-6 h-full">
      <Card className="grid grid-cols-2 px-8">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-wide">
            Vault Owners
          </h3>
        </div>
        <div>
          <section>
            <CardHeader>
              <CardTitle className="font-medium">Owners</CardTitle>
              <CardDescription>
                Vault owners are accounts that can vote, can propose, and sign
                and execute transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {owners.isLoading ? (
                <Skeleton className="w-full h-8" />
              ) : (
                <div className="flex flex-col gap-4 pt-4">
                  {owners.data?.map((owner) => (
                    <div key={owner} className="flex items-center gap-2">
                      <AptosAvatar value={owner} size={20} />
                      <p
                        className="font-display text-sm font-medium ml-1"
                        data-testid={`vault-owner-${owner}`}
                      >
                        {truncateAddress(owner)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          asChild
                        >
                          <a
                            href={getExplorerUrl({
                              network,
                              path: `account/${owner}`,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLinkIcon />
                          </a>
                        </Button>
                        {(owners.data?.length ?? 0) > 1 && isOwner && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                className="size-7 bg-transparent text-destructive-foreground shadow-none hover:bg-destructive/10"
                                data-testid={`remove-owner-button-${owner}`}
                              >
                                <TrashIcon />
                              </Button>
                            </DialogTrigger>
                            <RemoveOwnerModal ownerToRemove={owner} />
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Dialog
                onOpenChange={(isOpen) => {
                  if (!isOpen) setUniqueAddOwnerModalKey(Math.random());
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-4"
                    size="sm"
                    disabled={
                      !owners.data || !signaturesRequired.data || !isOwner
                    }
                    data-testid="settings-add-owner-button"
                  >
                    <PlusIcon />
                    Add Owner
                  </Button>
                </DialogTrigger>
                <AddOwnerModal
                  key={uniqueAddOwnerModalKey}
                  owners={owners.data ?? []}
                  signaturesRequired={Number(signaturesRequired.data ?? 1)}
                />
              </Dialog>
            </CardContent>
          </section>

          <br />
          <Separator />
          <br />

          <section>
            <CardHeader>
              <CardTitle className="font-medium">
                Transaction Signatures Required
              </CardTitle>
              <CardDescription>
                The number of signatures required to execute a transaction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signaturesRequired.isLoading ? (
                <Skeleton className="w-full h-8" />
              ) : (
                <div className="flex items-center mt-4 gap-2 font-display">
                  <span
                    className="font-semibold"
                    data-testid={`signatures-required-count-${signaturesRequired.data}`}
                  >
                    {signaturesRequired.data} signature
                    {signaturesRequired.data === 1 ? "" : "s"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    required out of {owners.data?.length ?? 0} owners
                  </span>
                </div>
              )}
            </CardContent>
          </section>
        </div>
      </Card>

      <Card className="grid grid-cols-2 px-8">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-wide">
            Dangerous Actions
          </h3>
        </div>
        <div>
          <section>
            <CardHeader>
              <CardTitle className="font-medium">Delete Vault</CardTitle>
              <CardDescription>
                Remove this vault from local storage. This action cannot be
                undone. The vault will still be available on-chain and can be
                re-imported using a backup file or vault address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <br />
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    data-testid="delete-vault-button"
                    onClick={() => trackEvent("delete_vault_attempt", {})}
                  >
                    <TrashIcon />
                    Remove Vault
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove Vault</DialogTitle>
                    <DialogDescription className="mt-2 font-sans">
                      Remove this vault from local storage. This action cannot
                      be undone. The vault will still be available on-chain and
                      can be re-imported using a backup file or vault address.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteVault(AccountAddress.from(vaultAddress));
                          trackEvent("delete_vault_success", {});
                          router.push("/");
                        }}
                        data-testid="confirm-delete-vault-button"
                      >
                        Remove Vault
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </section>
        </div>
      </Card>
    </div>
  );
}
