"use client";

import PageVaultHeader from "@/components/PageVaultHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DropZone from "@/components/DropZone";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  useSignAndSubmitTransaction,
  useSimulateTransaction,
  useWaitForTransaction,
} from "@aptos-labs/react";
import {
  AccountAddress,
  InputGenerateTransactionPayloadData,
  MoveVector,
} from "@aptos-labs/ts-sdk";
import {
  createMultisigTransactionPayloadData,
  formatPayloadWithAbi,
} from "@/lib/payloads";
import { useActiveVault } from "@/context/ActiveVaultProvider";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import ExpandingContainer from "@/components/ExpandingContainer";
import { LoadingSpinner } from "@/components/LoaderSpinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CodeBlock from "@/components/CodeBlock";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import Callout from "@/components/Callout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Abis } from "@/lib/abis";
import { getSimulationQueryErrors } from "@/lib/simulations/shared";
import { jsonStringify } from "@/lib/storage";
import useAnalytics from "@/hooks/useAnalytics";
const publishModuleJsonSchema = z.object({
  function_id: z.string(),
  type_args: z.array(z.object({ type: z.string(), value: z.string() })),
  args: z.tuple([
    z.object({ type: z.string(), value: z.string() }),
    z.object({ type: z.string(), value: z.array(z.string()) }),
  ]),
});

export default function PublishContractPage() {
  const trackEvent = useAnalytics();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { vaultAddress, network, id, isOwner } = useActiveVault();

  const [file, setFile] = useState<File | null>(null);

  const [page, setPage] = useState<"draft" | "confirm">("draft");

  const { data: jsonData, isError: isJsonError } = useQuery({
    queryKey: ["publish-module", file?.lastModified],
    queryFn: async () => {
      if (!file) throw new Error("No file uploaded");
      const json = JSON.parse(await file.text());
      return publishModuleJsonSchema.parse(json);
    },
    enabled: !!file,
    retry: false,
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
          new MoveVector(jsonData.args[1].value.map(MoveVector.U8)),
        ],
      } satisfies InputGenerateTransactionPayloadData;

      return {
        innerPayload,
        transactionPayload: createMultisigTransactionPayloadData({
          vaultAddress,
          payload: {
            ...innerPayload,
            abi: Abis["0x1::code::publish_package_txn"],
          },
        }),
      };
    } catch (error) {
      console.warn(error);
      return { transactionPayload: undefined, innerPayload: undefined };
    }
  }, [jsonData, vaultAddress]);

  const {
    hash,
    signAndSubmitTransaction,
    isPending: isSigningAndSubmitting,
  } = useSignAndSubmitTransaction({
    onSuccess: (data) => {
      trackEvent("create_publish_contract_proposal", { hash: data.hash });
    },
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
      toast.success("Proposal created");
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
      estimatePrioritizedGasUnitPrice: true,
    },
    enabled: innerPayload !== undefined,
  });

  const [isSimulationError, simulationError] =
    getSimulationQueryErrors(simulationData);

  const isSimulationSuccess =
    innerPayload && simulationData.isSuccess && simulationData.data.success;

  const isCreatingProposal = isSigningAndSubmitting || isWaitingForTransaction;

  return (
    <div className="p-8 ">
      <PageVaultHeader title="Publish Contract" />

      <br />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {page === "draft" && (
          <Card className="">
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
                title="How can I get a publishing JSON?"
                description={
                  <>
                    From the root of your Move project, you can run the
                    following command to get a publishing JSON:
                    <CodeBlock
                      value="aptos move build-publish-payload --json-output-file output.json"
                      className="[&>pre]:!bg-transparent mt-1 p-2 border bg-secondary rounded-md text-sm w-fit"
                    />
                  </>
                }
              />
              <br />

              <DropZone
                title="Upload Publishing JSON"
                description="Upload your publishing JSON file to deploy a contract"
                onFileUpload={setFile}
                disabled={!isOwner}
              />
              <br />
              <Button
                disabled={
                  !file || !jsonData || !isSimulationSuccess || !isOwner
                }
                onClick={() => setPage("confirm")}
                data-testid="publish-contract-confirm-draft-button"
              >
                Confirm Draft
              </Button>
            </CardContent>
          </Card>
        )}

        <Card
          className={cn("w-full h-fit", page === "confirm" && "col-span-2")}
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
                  key="simulation-loading"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
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
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent>
                    <div className="w-full flex justify-center items-center py-8">
                      <LoadingSpinner />
                    </div>
                  </CardContent>
                </motion.div>
              ) : isSimulationError || isJsonError ? (
                <motion.div
                  key="simulation-error"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent>
                    <div className="w-full flex justify-center items-center">
                      <div className="text-destructive bg-destructive/10 p-4 rounded-lg text-sm border border-destructive border-dashed">
                        <>
                          {isJsonError
                            ? "There is an issue with your JSON file. Please check the file and try again."
                            : simulationError}
                        </>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              ) : isSimulationSuccess ? (
                <motion.div
                  key="simulation-success"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className={"grid grid-cols-2 divide-x"}>
                    <div
                      className={cn(
                        "flex flex-col gap-6",
                        page === "draft" ? "col-span-2" : "pr-12"
                      )}
                    >
                      <div>
                        <h3 className="font-display text-lg font-semibold tracking-wide">
                          Payload
                        </h3>
                        <div className="max-h-96 overflow-auto w-full p-2 border rounded-md text-xs mt-4 bg-secondary">
                          <CodeBlock
                            value={jsonStringify(
                              formatPayloadWithAbi(
                                innerPayload,
                                Abis["0x1::code::publish_package_txn"]
                              )
                            )}
                            className="[&>pre]:!bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-semibold tracking-wide">
                          Details
                        </h3>
                        <div className="pt-4">
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground font-display">
                            <span>Max Gas Amount:</span>
                            <span>
                              {Number(simulationData.data.gas_used) * 2}
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
                      </div>

                      {page === "confirm" && (
                        <>
                          <Callout
                            title="Always Verify"
                            description="Before signing, always verify the transaction details and the transaction payload."
                            status="loading"
                          />
                          <Separator />
                          <div className="flex gap-4">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setPage("draft");
                                setFile(null);
                              }}
                            >
                              <ArrowLeftIcon />
                              Go Back
                            </Button>
                            <Button
                              onClick={createProposal}
                              isLoading={isCreatingProposal}
                              data-testid="publish-contract-create-proposal-button"
                            >
                              Create Proposal
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {page === "confirm" && (
                      <div className="flex flex-col gap-6 pl-12">
                        <div>
                          <h3 className="font-display text-lg font-semibold tracking-wide">
                            Writesets
                          </h3>
                          <div>
                            <div className="max-h-96 overflow-auto w-full p-2 border rounded-md text-xs mt-4 bg-secondary">
                              <CodeBlock
                                value={jsonStringify(
                                  simulationData.data.changes
                                )}
                                className="[&>pre]:!bg-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-display text-lg font-semibold tracking-wide">
                            Events
                          </h3>
                          <div>
                            <div className="max-h-96 overflow-auto w-full p-2 border rounded-md text-xs mt-4 bg-secondary">
                              <CodeBlock
                                value={jsonStringify(
                                  simulationData.data.events
                                )}
                                className="[&>pre]:!bg-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </ExpandingContainer>
        </Card>
      </div>
    </div>
  );
}
