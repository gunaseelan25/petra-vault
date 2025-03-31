import {
  AccountAddress,
  AccountAddressInput,
  UserTransactionResponse,
  WriteSetChange,
  WriteSetChangeWriteResource
} from '@aptos-labs/ts-sdk';
import { UseQueryResult } from '@tanstack/react-query';

export function isWriteResourceChange(
  change: WriteSetChange
): change is WriteSetChangeWriteResource {
  return change.type === 'write_resource';
}

/**
 * More of a precaution, but we should normalize all parsed addresses to prevent
 * mismatches related to leading zeros
 * @param address
 */
export function normalizeAddress(address: AccountAddressInput) {
  return AccountAddress.from(address).toStringLong();
}

/**
 * The (creatorAddress, eventStreamCreationNum) pair uniquely identifies an event stream on chain
 * @param creatorAddress
 * @param creationNum
 */
export function serializeEventGuid(
  creatorAddress: AccountAddressInput,
  creationNum: string
) {
  return `${normalizeAddress(creatorAddress)}_${creationNum}`;
}

export function getSimulationQueryErrors(
  result: UseQueryResult<UserTransactionResponse, Error>
): [isError: boolean | undefined, message: string | undefined] {
  return [
    result.isError || (result.data && !result.data.success),
    result.error?.message ??
      result.data?.vm_status ??
      'An unknown error occurred with simulating your transaction.'
  ];
}

export const explainError = (error?: string) => {
  if (error?.includes('MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS')) {
    return 'The account must have some APT to create a proposal. Please add some APT to the Vault and try again.';
  }
  return error;
};
