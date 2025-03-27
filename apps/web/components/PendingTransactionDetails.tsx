import { PendingMultisigTransaction } from '@/hooks/useMultisigPendingTransactions';
import {
  createMultisigVoteTransactionPayloadData,
  deserializeMultisigTransactionPayload,
  formatPayloadWithAbi
} from '@/lib/payloads';
import { useEffect } from 'react';
import { Badge } from './ui/badge';
import useMultisigSignaturesRequired from '@/hooks/useMultisigSignaturesRequired';
import { Separator } from './ui/separator';
import CodeBlock from './CodeBlock';
import {
  AccountAddress,
  buildTransaction,
  Deserializer,
  Hex,
  MultiSig,
  MultiSigTransactionPayload,
  TransactionPayloadMultiSig
} from '@aptos-labs/ts-sdk';
import useMultisigOwners from '@/hooks/useMultisigOwners';
import { AptosAvatar } from 'aptos-avatars-react';
import { truncateAddress } from '@aptos-labs/wallet-adapter-react';
import { Button } from './ui/button';
import {
  useClients,
  useSignAndSubmitTransaction,
  useWaitForTransaction
} from '@aptos-labs/react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import useMultisigCanExecute from '@/hooks/useMultisigCanExecute';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { LoadingSpinner } from './LoaderSpinner';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Callout from './Callout';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon
} from '@radix-ui/react-icons';
import useEntryFunctionAbi from '@/hooks/useEntryFunctionAbi';
import { jsonStringify } from '@/lib/storage';

interface PendingTransactionDetailsProps {
  transaction: PendingMultisigTransaction;
  sequenceNumber: number;
}

export const PendingTransactionDetails = ({
  transaction,
  sequenceNumber
}: PendingTransactionDetailsProps) => {
  const queryClient = useQueryClient();
  const { aptos } = useClients();
  const { account } = useWallet();

  const { data: owners } = useMultisigOwners({
    address: transaction.multisigAddress.toString()
  });

  const { data: canExecute } = useMultisigCanExecute({
    address: transaction.multisigAddress.toString(),
    sequenceNumber
  });

  const { data: signaturesRequired } = useMultisigSignaturesRequired({
    address: transaction.multisigAddress.toString()
  });

  const payload = transaction.payload
    ? deserializeMultisigTransactionPayload(transaction.payload)
    : undefined;

  const { data: entryFunctionAbi } = useEntryFunctionAbi({
    entryFunction: payload?.function
  });

  const {
    hash: voteHash,
    signAndSubmitTransaction: signAndSubmitVote,
    isPending: isSignAndSubmitVotePending
  } = useSignAndSubmitTransaction();

  const { isSuccess: isVoteSuccess, isLoading: isVoteTransactionLoading } =
    useWaitForTransaction({ hash: voteHash });

  useEffect(() => {
    if (isVoteSuccess) {
      queryClient.invalidateQueries();
      toast.success('Transaction voted!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoteSuccess]);

  const {
    hash: executeHash,
    signAndSubmitTransaction: signAndSubmitExecute,
    isPending: isSignAndSubmitExecutePending
  } = useSignAndSubmitTransaction();

  const {
    isSuccess: isExecuteSuccess,
    isLoading: isExecuteTransactionLoading
  } = useWaitForTransaction({ hash: executeHash });

  useEffect(() => {
    if (isExecuteSuccess) {
      queryClient.invalidateQueries();
      toast.success('Transaction executed!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExecuteSuccess]);

  if (!payload || !entryFunctionAbi) return null;

  const isUserApproved =
    account &&
    transaction.votes.approvals.some((approval) =>
      AccountAddress.from(approval).equals(account?.address)
    );

  const hasEnoughApprovals =
    transaction.votes.approvals.length >= Number(signaturesRequired);

  const handleVote = (approve: boolean) =>
    signAndSubmitVote({
      data: createMultisigVoteTransactionPayloadData({
        vaultAddress: transaction.multisigAddress.toString(),
        sequenceNumber,
        approve
      })
    });

  const handleExecute = async (transactionPayload: string) => {
    if (!account?.address) return;

    const multisigPayload = MultiSigTransactionPayload.deserialize(
      new Deserializer(Hex.fromHexInput(transactionPayload).toUint8Array())
    );

    const txn = await buildTransaction({
      aptosConfig: aptos.config,
      sender: account.address,
      payload: new TransactionPayloadMultiSig(
        new MultiSig(transaction.multisigAddress, multisigPayload)
      )
    });

    signAndSubmitExecute({ transaction: txn });
  };

  const handleExecuteRejection = async () => {
    if (!account?.address) return;

    signAndSubmitExecute({
      data: {
        function: '0x1::multisig_account::execute_rejected_transaction',
        functionArguments: [transaction.multisigAddress]
      }
    });
  };

  return (
    <div className="p-4 border rounded-md my-2 w-full flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full w-full">
        <div className="border-r pr-4 col-span-2 h-full flex flex-col">
          <p className="font-display font-semibold">Payload</p>
          <div className="flex-1 overflow-auto w-full p-2 border rounded-md text-xs mt-2 bg-secondary">
            <CodeBlock
              value={jsonStringify(
                formatPayloadWithAbi(payload, entryFunctionAbi)
              )}
              className="[&>pre]:!bg-transparent "
            />
          </div>
        </div>

        <div className="h-full col-span-3 flex flex-col">
          <p className="font-display font-semibold">
            Transaction Details #{sequenceNumber}
          </p>

          <Separator className="my-2 mb-4" />

          <div className="grid grid-cols-2 flex-1 gap-4 divide-x">
            <div className="pr-4 flex flex-col">
              <p className="font-display font-medium">Confirmations</p>
              <p className="text-xs text-muted-foreground mb-4">
                The transaction requires {signaturesRequired} approval
                {signaturesRequired === 1 ? '' : 's'} from the owners to
                execute.
              </p>

              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-4 overflow-y-auto">
                {owners?.map((owner) => {
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
                            ? 'success'
                            : isRejected
                              ? 'destructive'
                              : 'secondary'
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
            </div>

            <div className="flex flex-col justify-between w-full h-full">
              <p className="font-display font-medium">Actions</p>
              {hasEnoughApprovals && canExecute && (
                <Callout
                  status="success"
                  title="Transaction is ready to be executed"
                  description="The transaction has enough approvals and can be executed."
                  className="my-4"
                />
              )}
              {!hasEnoughApprovals && (
                <Callout
                  status="error"
                  title="Transaction is not ready to be executed"
                  description="The transaction does not have enough approvals. You can now remove it from the sequence."
                  className="my-4"
                />
              )}
              {hasEnoughApprovals && !canExecute && (
                <Callout
                  status="loading"
                  title="Transaction is waiting for execution"
                  description="Please execute transactions ahead of the sequence in order to execute this transaction."
                  className="my-4"
                />
              )}
              {signaturesRequired && transaction.payload ? (
                <div className="flex w-full gap-2">
                  {!isUserApproved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      isLoading={
                        isSignAndSubmitVotePending || isVoteTransactionLoading
                      }
                      onClick={() => handleVote(true)}
                    >
                      Approve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      isLoading={
                        isSignAndSubmitVotePending || isVoteTransactionLoading
                      }
                      onClick={() => handleVote(false)}
                    >
                      Reject
                    </Button>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {hasEnoughApprovals ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={!canExecute}
                            isLoading={
                              isSignAndSubmitExecutePending ||
                              isExecuteTransactionLoading
                            }
                            onClick={() => handleExecute(transaction.payload!)}
                          >
                            Execute Transaction
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            isLoading={
                              isSignAndSubmitExecutePending ||
                              isExecuteTransactionLoading
                            }
                            onClick={() => handleExecuteRejection()}
                          >
                            Remove Transaction
                          </Button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {!hasEnoughApprovals
                            ? 'Reject the transaction and remove it from the sequence'
                            : !canExecute
                              ? 'Execute transactions in ahead in the sequence before this one'
                              : 'Execute the transaction and send it to the network'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="flex items-center h-full justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
