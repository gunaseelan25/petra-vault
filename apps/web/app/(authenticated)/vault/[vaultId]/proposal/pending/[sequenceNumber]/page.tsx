"use client";

import PageVaultHeader from "@/components/PageVaultHeader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AptosAvatar } from "aptos-avatars-react";
import { AccountAddress, truncateAddress } from "@aptos-labs/ts-sdk";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useActiveProposal } from "@/context/ActiveProposalProvider";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import CodeBlock from "@/components/CodeBlock";
import {
  createMultisigVoteTransactionPayloadData,
  formatPayloadWithAbi,
} from "@/lib/payloads";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSignAndSubmitTransaction,
  useWaitForTransaction,
} from "@aptos-labs/react";
import { toast } from "sonner";
import { useActiveVault } from "@/context/ActiveVaultProvider";
import Callout from "@/components/Callout";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "motion/react";
import { LoadingSpinner } from "@/components/LoaderSpinner";
import SimulationParser from "@/lib/simulations/parsers/SimulationParser";
import SimulationCoinRow from "@/components/SimulationCoinRow";
import { PendingTransactionRow } from "@/components/PendingTransactionRow";
import { useRouter } from "next/navigation";
import { jsonStringify } from "@/lib/storage";
import Link from "next/link";
import useAnalytics from "@/hooks/useAnalytics";

export default function ProposalPage() {
  const trackEvent = useAnalytics();

  const queryClient = useQueryClient();
  const router = useRouter();

  const { vaultAddress, id } = useActiveVault();

  const {
    sequenceNumber,
    transaction: { data: transaction },
    signaturesRequired: { data: signaturesRequired },
    owners,
    innerPayload,
    entryFunctionAbi,
    isUserApproved,
    transactionPayload,
    canExecute,
    hasEnoughApprovals,
    hasEnoughRejections,
    simulation,
    pendingTransactionsAhead,
    latestSequenceNumber: { data: latestSequenceNumber },
    isNext,
    hasUserCastedVote,
  } = useActiveProposal();

  const balanceChanges = simulation.data
    ? SimulationParser.parseTransaction(simulation.data)?.getBalanceChanges()[
        vaultAddress
      ]
    : undefined;

  // Voting

  const {
    hash: secondaryActionHash,
    signAndSubmitTransaction: signAndSubmitSecondaryAction,
    isPending: isSignAndSubmitSecondaryActionPending,
  } = useSignAndSubmitTransaction({
    onSuccess(data, variables) {
      trackEvent("vote_proposal", {
        hash: data.hash,
        action:
          "data" in variables &&
          "function" in variables.data &&
          variables.data.function ===
            "0x1::multisig_account::approve_transaction"
            ? "approve"
            : "reject",
      });
    },
  });

  const {
    isSuccess: isSecondaryActionSuccess,
    isLoading: isSecondaryTransactionLoading,
  } = useWaitForTransaction({ hash: secondaryActionHash });

  useEffect(() => {
    if (isSecondaryActionSuccess) {
      queryClient.invalidateQueries();
      toast.success("Transaction voted!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSecondaryActionSuccess]);

  const handleSecondaryAction = (approve: boolean) =>
    signAndSubmitSecondaryAction({
      data: createMultisigVoteTransactionPayloadData({
        vaultAddress,
        sequenceNumber,
        approve,
      }),
    });

  const isSecondaryActionLoading =
    isSignAndSubmitSecondaryActionPending || isSecondaryTransactionLoading;

  // Primary Action

  const {
    hash: primaryActionHash,
    signAndSubmitTransaction: signAndSubmitPrimaryAction,
    isPending: isSignAndSubmitPrimaryActionPending,
  } = useSignAndSubmitTransaction({
    onSuccess(data, variables) {
      if ("data" in variables && "function" in variables.data) {
        if (
          variables.data.function ===
          "0x1::multisig_account::execute_transaction"
        ) {
          trackEvent("execute_proposal", {
            hash: data.hash,
          });
        } else if (
          variables.data.function ===
          "0x1::multisig_account::execute_rejected_transaction"
        ) {
          trackEvent("remove_proposal", { hash: data.hash });
        }
      }
    },
  });

  const {
    isSuccess: isPrimaryActionSuccess,
    isLoading: isPrimaryTransactionLoading,
  } = useWaitForTransaction({ hash: primaryActionHash });

  useEffect(() => {
    if (isPrimaryActionSuccess) {
      queryClient.invalidateQueries();
      toast.success("Transaction executed!");
      router.push(`/vault/${id}/transactions`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrimaryActionSuccess]);

  const handlePrimaryAction = async (action: "execute" | "remove") => {
    if (action === "remove") {
      signAndSubmitPrimaryAction({
        data: {
          function: "0x1::multisig_account::execute_rejected_transaction",
          functionArguments: [vaultAddress],
        },
      });
    }

    if (action === "execute") {
      const transaction = await transactionPayload.refetch();

      if (!transaction.data) {
        return toast.error(
          "There was an issue building your transaction, please try again."
        );
      }

      signAndSubmitPrimaryAction({ transaction: transaction.data });
    }
  };

  const isPrimaryActionLoading =
    isSignAndSubmitPrimaryActionPending || isPrimaryTransactionLoading;

  if (!transaction) return null;

  return (
    <div className="p-8 h-full">
      <PageVaultHeader title={`Proposal #${sequenceNumber}`} />

      <br />

      <div className="h-full grid grid-cols-8 gap-4">
        <Card className="col-span-5 h-fit">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              This is a pending proposal that has not yet been executed.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-4">
            <div>
              <CardTitle>Payload</CardTitle>
              <CardDescription>
                The transaction payload is the function and arguments that will
                be executed.
              </CardDescription>
              <div className="flex-1 overflow-auto w-full p-2 border rounded-md text-xs mt-2 bg-secondary">
                {innerPayload && entryFunctionAbi.data && (
                  <CodeBlock
                    value={jsonStringify(
                      formatPayloadWithAbi(innerPayload, entryFunctionAbi.data)
                    )}
                    className="[&>pre]:!bg-transparent "
                  />
                )}
              </div>
            </div>

            <div>
              <div className="pt-2">
                <AnimatePresence mode="popLayout">
                  {simulation.isLoading ? (
                    <motion.div
                      key="simulation-loading"
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(10px)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-full flex justify-center items-center py-8">
                        <LoadingSpinner />
                      </div>
                    </motion.div>
                  ) : simulation.isError ? (
                    <motion.div
                      key="simulation-error"
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(10px)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardTitle>Transaction Simulation</CardTitle>
                      <CardDescription className="mb-4">
                        This simulation shows a preview of the
                        transaction&apos;s details when executed.
                      </CardDescription>
                      <div className="w-full flex justify-center items-center">
                        <div className="text-destructive bg-destructive/10 p-4 rounded-lg text-sm border border-destructive border-dashed">
                          <>{simulation.simulationError}</>
                        </div>
                      </div>
                    </motion.div>
                  ) : simulation.isSuccess ? (
                    <motion.div
                      key="simulation-success"
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(10px)" }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <CardHeader className="px-0">
                          <CardTitle>Balance Changes</CardTitle>
                          <CardDescription className="mb-4">
                            This shows a preview of the vault&apos;s asset
                            changes after the transaction is executed.
                          </CardDescription>
                        </CardHeader>
                        <div>
                          {balanceChanges ? (
                            <div className="pb-4 pt-2 flex flex-col gap-2">
                              {Object.entries(balanceChanges).map(
                                ([asset, change]) => (
                                  <SimulationCoinRow
                                    key={`${vaultAddress}-${asset}`}
                                    asset={asset}
                                    delta={change.delta}
                                  />
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-muted-foreground border border-dashed rounded-lg w-full bg-secondary text-center text-sm py-8">
                              No balance changes
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <CardHeader className="px-0">
                          <CardTitle>Miscellaneous Details</CardTitle>
                          <CardDescription>
                            Other details about the transaction including gas
                            and expiration.
                          </CardDescription>
                        </CardHeader>
                        <div className="pt-4 mb-4">
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground font-display">
                            <span>Max Gas Amount:</span>
                            <span>{Number(simulation.data.gas_used) * 2}</span>
                            <span>Gas Unit Price:</span>
                            <span>{simulation.data.gas_unit_price}</span>
                            <span>Expiration Timestamp:</span>
                            <span>
                              {new Date(
                                Number(
                                  simulation.data.expiration_timestamp_secs
                                ) * 1000
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {!hasEnoughApprovals && !hasEnoughRejections && (
              <Callout
                status="error"
                title="Transaction is not ready to be executed"
                description="The transaction does not have enough approvals or rejections. Please cast votes to either reject or approve the transaction."
              />
            )}
            {hasEnoughRejections && !hasEnoughApprovals && isNext && (
              <Callout
                status="error"
                title="Transaction has been rejected"
                description="The transaction has enough rejections to be removed from the sequence."
              />
            )}
            {(hasEnoughApprovals || hasEnoughRejections) &&
              !canExecute.data &&
              !isNext && (
                <Callout
                  status="loading"
                  title="Transaction is waiting for execution"
                  description="Please execute transactions ahead of the sequence in order to execute this transaction."
                />
              )}
            {hasEnoughApprovals && canExecute.data && isNext && (
              <Callout
                status="success"
                title="Transaction is ready to be executed"
                description="The transaction has enough approvals and can be executed."
              />
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex gap-4 max-w-2xl">
            {(!hasUserCastedVote || isUserApproved) && (
              <Button
                variant="outline"
                className="flex-1"
                isLoading={isSecondaryActionLoading}
                onClick={() => handleSecondaryAction(false)}
                data-testid="reject-transaction-button"
              >
                Reject
              </Button>
            )}

            {!isUserApproved && (
              <Button
                variant="outline"
                className="flex-1"
                isLoading={isSecondaryActionLoading}
                onClick={() => handleSecondaryAction(true)}
                data-testid="approve-transaction-button"
              >
                Approve
              </Button>
            )}

            {hasUserCastedVote &&
              (hasEnoughApprovals ? (
                <Button
                  className="flex-1"
                  disabled={!canExecute.data || !isNext}
                  isLoading={isPrimaryActionLoading}
                  onClick={() => handlePrimaryAction("execute")}
                  data-testid="execute-transaction-button"
                >
                  Execute Transaction
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  disabled={!isNext || !hasEnoughRejections}
                  isLoading={isPrimaryActionLoading}
                  onClick={() => handlePrimaryAction("remove")}
                  data-testid="remove-transaction-button"
                >
                  Remove Transaction
                </Button>
              ))}
          </CardFooter>
        </Card>

        <div className="col-span-3 h-full flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Confirmations</CardTitle>
              <CardDescription>
                The transaction requires {signaturesRequired} approval
                {signaturesRequired === 1 ? "" : "s"} from the owners to
                execute.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground grid grid-cols-2 lg:grid-cols-3 gap-4">
                {owners.data?.map((owner) => {
                  const isApproved = transaction.votes.approvals.some(
                    (approval) => AccountAddress.from(owner).equals(approval)
                  );
                  const isRejected = transaction.votes.rejections.some(
                    (rejection) => AccountAddress.from(owner).equals(rejection)
                  );

                  return (
                    <div
                      key={owner}
                      className="flex items-center gap-2 w-full flex-wrap"
                    >
                      <div className="min-w-[20px] min-h-[20px]">
                        <AptosAvatar value={owner} size={20} />
                      </div>
                      <p>{truncateAddress(owner)}</p>
                      <Badge
                        variant={
                          isApproved
                            ? "success"
                            : isRejected
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {isApproved ? (
                          <CheckCircledIcon />
                        ) : isRejected ? (
                          <CrossCircledIcon />
                        ) : (
                          <QuestionMarkCircledIcon />
                        )}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {(pendingTransactionsAhead?.length ?? 0) > 0 &&
            latestSequenceNumber && (
              <Card className="gap-2">
                <CardHeader>
                  <CardTitle>Pending Transactions Ahead</CardTitle>
                  <CardDescription>
                    Transactions ahead in the queue must be executed first
                    before this one can be executed.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {pendingTransactionsAhead?.map((transaction, i) => {
                    const sequenceNumber = latestSequenceNumber + i + 1;
                    return (
                      <Link
                        key={transaction.payloadHash}
                        href={`/vault/${id}/proposal/pending/${sequenceNumber}`}
                      >
                        <PendingTransactionRow
                          isNext={latestSequenceNumber + 1 === sequenceNumber}
                          transaction={transaction}
                          sequenceNumber={sequenceNumber}
                          showSequenceNumber={false}
                        />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            )}

          {simulation.data && (
            <>
              <Card className="gap-0">
                <CardHeader>
                  <CardTitle>Writesets</CardTitle>
                  <CardDescription>
                    The writesets are the changes that will be made to the
                    account&apos;s resources.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto w-full p-2 border rounded-md text-xs mt-4 bg-secondary">
                    <CodeBlock
                      value={jsonStringify(simulation.data.changes)}
                      className="[&>pre]:!bg-transparent"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="gap-0">
                <CardHeader>
                  <CardTitle>Events</CardTitle>
                  <CardDescription>
                    The events are the events that will be emitted by the
                    transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto w-full p-2 border rounded-md text-xs mt-4 bg-secondary">
                    <CodeBlock
                      value={jsonStringify(simulation.data.events)}
                      className="[&>pre]:!bg-transparent"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
