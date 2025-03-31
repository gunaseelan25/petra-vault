'use client';

import PageVaultHeader from '@/components/PageVaultHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import DropZone from '@/components/DropZone';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  useSignAndSubmitTransaction,
  useSimulateTransaction,
  useWaitForTransaction
} from '@aptos-labs/react';
import {
  AccountAddress,
  InputGenerateTransactionPayloadData,
  MoveVector
} from '@aptos-labs/ts-sdk';
import {
  createMultisigTransactionPayloadData,
  formatPayloadWithAbi
} from '@/lib/payloads';
import { useActiveVault } from '@/context/ActiveVaultProvider';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import ExpandingContainer from '@/components/ExpandingContainer';
import { LoadingSpinner } from '@/components/LoaderSpinner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CodeBlock from '@/components/CodeBlock';
import Callout from '@/components/Callout';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Abis } from '@/lib/abis';
import {
  explainError,
  getSimulationQueryErrors
} from '@/lib/simulations/shared';
import { jsonStringify } from '@/lib/storage';
import useAnalytics from '@/hooks/useAnalytics';
import CreateProposalConfirmationActions from '@/components/CreateProposalConfirmationActions';
import { padEstimatedGas } from '@/lib/gas';

const publishModuleJsonSchema = z.object({
  function_id: z.string(),
  type_args: z.array(z.object({ type: z.string(), value: z.string() })),
  args: z.tuple([
    z.object({ type: z.string(), value: z.string() }),
    z.object({ type: z.string(), value: z.array(z.string()) })
  ])
});

export default function PublishContractPage() {
  const trackEvent = useAnalytics();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { vaultAddress, network, id, isOwner } = useActiveVault();

  const [file, setFile] = useState<File | null>(null);

  const [page, setPage] = useState<'draft' | 'confirm'>('draft');

  const { data: jsonData, isError: isJsonError } = useQuery({
    queryKey: ['publish-module', file?.lastModified],
    queryFn: async () => {
      if (!file) throw new Error('No file uploaded');
      const json = JSON.parse(await file.text());
      return publishModuleJsonSchema.parse(json);
    },
    enabled: !!file,
    retry: false
  });

  const { transactionPayload, innerPayload } = useMemo(() => {
    if (!jsonData) {
      return { transactionPayload: undefined, innerPayload: undefined };
    }

    try {
      const innerPayload = {
        function: jsonData.function_id as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [
          MoveVector.U8(jsonData.args[0].value),
          new MoveVector(jsonData.args[1].value.map(MoveVector.U8))
        ]
      } satisfies InputGenerateTransactionPayloadData;

      return {
        innerPayload,
        transactionPayload: createMultisigTransactionPayloadData({
          vaultAddress,
          payload: {
            ...innerPayload,
            abi: Abis['0x1::code::publish_package_txn']
          }
        })
      };
    } catch (error) {
      console.warn(error);
      return { transactionPayload: undefined, innerPayload: undefined };
    }
  }, [jsonData, vaultAddress]);

  const {
    hash,
    signAndSubmitTransaction,
    isPending: isSigningAndSubmitting
  } = useSignAndSubmitTransaction({
    onSuccess: (data) => {
      trackEvent('create_publish_contract_proposal', { hash: data.hash });
    }
  });

  const { isSuccess, isLoading: isWaitingForTransaction } =
    useWaitForTransaction({ hash });

  const createProposal = useCallback(() => {
    if (!transactionPayload) {
      toast.error(`There was an error creating your proposal`);
      return;
    }

    signAndSubmitTransaction({ data: transactionPayload });
  }, [signAndSubmitTransaction, transactionPayload]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Proposal created');
      router.push(`/vault/${id}/transactions`);
      queryClient.invalidateQueries();
    }
  }, [isSuccess, router, vaultAddress, hash, id, queryClient]);

  const simulationData = useSimulateTransaction({
    data: innerPayload,
    network: { network },
    sender: AccountAddress.from(vaultAddress),
    options: {
      estimateMaxGasAmount: true,
      estimateGasUnitPrice: true,
      estimatePrioritizedGasUnitPrice: true
    },
    enabled: innerPayload !== undefined
  });

  const [isSimulationError, simulationError] =
    getSimulationQueryErrors(simulationData);

  const isSimulationSuccess =
    innerPayload && simulationData.isSuccess && simulationData.data.success;

  const isCreatingProposal = isSigningAndSubmitting || isWaitingForTransaction;

  const renderConfirmationActions = useMemo(
    // eslint-disable-next-line react/display-name
    () => () => {
      return (
        <CreateProposalConfirmationActions
          onBack={() => {
            setPage('draft');
            setFile(null);
          }}
          onCreateProposal={createProposal}
          isLoading={isCreatingProposal}
        />
      );
    },
    [createProposal, isCreatingProposal]
  );
  return (
    <div className="p-4 md:p-8 flex flex-col h-full">
      <PageVaultHeader title="Publish Contract" />

      <br />

      <div className="grid grid-cols-2 gap-4 pb-12">
        {page === 'draft' && (
          <Card className="col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle>Publish Contract</CardTitle>
              <CardDescription>
                Publish a contract to the Aptos blockchain using your
                vault&apos;s account.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Callout
                status="loading"
                title="Publishing Smart Contracts Guide"
                description={
                  <p>
                    Learn how to publish a smart contract using your Vault with{' '}
                    <a
                      className="font-bold underline"
                      target="_blank"
                      href="https://petra.app/vault/guides/publish-contract"
                      rel="noopener noreferrer"
                    >
                      this guide.
                    </a>
                  </p>
                }
              />
              <br />

              <DropZone
                title="Upload Publishing JSON"
                description="Upload your publishing JSON file to deploy a contract"
                onFileUpload={setFile}
                disabled={!isOwner}
              />
            </CardContent>
          </Card>
        )}

        <Card
          className={cn(
            'w-full h-fit',
            page === 'draft'
              ? isSimulationError || isJsonError || isSimulationSuccess
                ? 'flex col-span-2 xl:col-span-1'
                : 'hidden xl:flex col-span-2 xl:col-span-1'
              : undefined,
            page === 'confirm' && 'flex col-span-2'
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Simulation</CardTitle>
              {isSimulationSuccess ? (
                <Badge variant="success">Success</Badge>
              ) : isSimulationError || isJsonError ? (
                <Badge variant="destructive">Error</Badge>
              ) : null}
            </div>
            <CardDescription>
              Preview of transaction execution results
            </CardDescription>
          </CardHeader>
          <ExpandingContainer>
            <AnimatePresence mode="popLayout">
              {!file ? (
                <motion.div
                  key="simulation-idle"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent>
                    <div className="text-center py-16 font-display text-muted-foreground bg-secondary border border-dashed rounded-lg text-sm">
                      Please upload a publishing JSON
                    </div>
                  </CardContent>
                </motion.div>
              ) : simulationData.isLoading ? (
                <motion.div
                  key="simulation-loading"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="w-full flex justify-center items-center py-8">
                    <LoadingSpinner />
                  </CardContent>
                </motion.div>
              ) : isSimulationError || isJsonError ? (
                <motion.div
                  key="simulation-error"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="w-full flex justify-center items-center">
                    <div className="text-destructive bg-destructive/10 p-4 rounded-lg text-sm border border-destructive border-dashed break-all">
                      {isJsonError
                        ? 'There is an issue with your JSON file. Please check the file and try again.'
                        : explainError(simulationError)}
                    </div>
                  </CardContent>
                </motion.div>
              ) : isSimulationSuccess ? (
                <motion.div
                  key="simulation-success"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent
                    className={'grid grid-cols-2 gap-6 xl:divide-x xl:gap-0'}
                  >
                    <div
                      className={cn(
                        'flex flex-col gap-6',
                        page === 'draft' ? 'col-span-2' : 'xl:pr-12',
                        page === 'confirm' && 'col-span-2 xl:col-span-1'
                      )}
                    >
                      <div>
                        <h3 className="font-display text-lg font-semibold tracking-wide">
                          Payload
                        </h3>
                        <CodeBlock
                          value={jsonStringify(
                            formatPayloadWithAbi(
                              innerPayload,
                              Abis['0x1::code::publish_package_txn']
                            )
                          )}
                          className="[&>pre]:!bg-transparent [&>pre]:p-2 max-h-96 overflow-auto w-full border rounded-md text-xs mt-4 bg-secondary"
                        />
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-semibold tracking-wide">
                          Details
                        </h3>
                        <div className="grid grid-cols-2 gap-2 pt-4 text-sm text-muted-foreground font-display">
                          <span>Max Gas Amount:</span>
                          <span>
                            {padEstimatedGas(
                              Number(simulationData.data.gas_used)
                            )}
                          </span>
                          <span>Gas Unit Price:</span>
                          <span>{simulationData.data.gas_unit_price}</span>
                          <span>Expiration Timestamp:</span>
                          <span>
                            {new Date(
                              Number(
                                simulationData.data.expiration_timestamp_secs
                              ) * 1000
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {page === 'confirm' && (
                        <div className="hidden xl:grid">
                          {renderConfirmationActions()}
                        </div>
                      )}
                    </div>

                    {page === 'confirm' && (
                      <div className="flex flex-col col-span-2 xl:col-span-1 gap-4 xl:pl-12">
                        <h3 className="font-display text-lg font-semibold tracking-wide">
                          Writesets
                        </h3>
                        <CodeBlock
                          value={jsonStringify(simulationData.data.changes)}
                          className="[&>pre]:!bg-transparent [&>pre]:p-2 max-h-96 overflow-auto w-full border rounded-md text-xs bg-secondary"
                        />

                        <h3 className="font-display text-lg font-semibold tracking-wide">
                          Events
                        </h3>
                        <CodeBlock
                          value={jsonStringify(simulationData.data.events)}
                          className="[&>pre]:!bg-transparent [&>pre]:p-2 max-h-96 overflow-auto w-full border rounded-md text-xs bg-secondary"
                        />
                      </div>
                    )}

                    {page === 'confirm' && (
                      <div className="col-span-2 xl:hidden">
                        {renderConfirmationActions()}
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </ExpandingContainer>
        </Card>

        <Button
          disabled={!file || !jsonData || !isSimulationSuccess || !isOwner}
          onClick={() => setPage('confirm')}
          data-testid="publish-contract-confirm-draft-button"
          className={cn('w-fit', page === 'confirm' && 'hidden')}
        >
          {!isSimulationError ? 'Confirm Draft' : 'Simulation Errors Found'}
        </Button>
      </div>
    </div>
  );
}
