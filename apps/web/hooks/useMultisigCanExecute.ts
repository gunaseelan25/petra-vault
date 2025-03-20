import { ModuleViewReturnType } from "@/lib/types/modules";
import { useViewModule, UseViewModuleParameters } from "@aptos-labs/react";

export interface UseMultisigCanExecuteOptions
  extends Omit<
    UseViewModuleParameters<
      ModuleViewReturnType<"0x1::multisig_account::can_be_executed">
    >,
    "payload"
  > {
  address: string;
  sequenceNumber: number;
}

export default function useMultisigCanExecute({
  address,
  sequenceNumber,
  ...options
}: UseMultisigCanExecuteOptions) {
  const { data, ...query } = useViewModule<
    ModuleViewReturnType<"0x1::multisig_account::can_be_executed">
  >({
    payload: {
      function: "0x1::multisig_account::can_be_executed",
      functionArguments: [address, sequenceNumber],
    },
    ...options,
  });
  return { data: data?.at(0), ...query };
}
