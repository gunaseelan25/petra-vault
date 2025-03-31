import { EntryFunctionPayloadResponse } from '@aptos-labs/ts-sdk';

import { MultisigPayloadResponse } from '@aptos-labs/ts-sdk';

export interface TransactionOptions {
  expirationSecondsFromNow?: number;
  expirationTimestamp?: number;
  gasUnitPrice?: number;
  maxGasAmount?: number;
  sender?: string;
  sequenceNumber?: number;
}

export type EntryFunctionJsonTransactionPayload =
  EntryFunctionPayloadResponse & {
    type: 'entry_function_payload';
  };

export type MultisigJsonTransactionPayload = MultisigPayloadResponse & {
  type: 'multisig_payload';
};

export type JsonTransactionPayload =
  | EntryFunctionJsonTransactionPayload
  | MultisigJsonTransactionPayload;
