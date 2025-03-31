import {
  AccountAuthenticator,
  RawTransaction,
  FeePayerRawTransaction
} from '@aptos-labs/ts-sdk';

import { TransactionPayload } from '@aptos-labs/ts-sdk';
import { bcsDeserialize, isSerializable } from './bcsSerialization';
import {
  deserializeJsonTransactionPayload,
  serializeJsonTransactionPayload
} from './jsonPayload';
import {
  deserializeRawTransaction,
  SerializedFeePayerRawTransaction,
  SerializedSimpleRawTransaction,
  serializeRawTransaction
} from './rawTxn';
import { UnexpectedValueError } from '../errors';
import {
  TransactionOptions,
  JsonTransactionPayload
} from '../types/transactions';

export interface SignAndSubmitTransactionWithPayloadRequestArgs {
  options?: TransactionOptions;
  payload: JsonTransactionPayload | TransactionPayload;
}

export interface SignAndSubmitTransactionWithRawTxnRequestArgs {
  rawTxn: RawTransaction;
}

export interface SignAndSubmitTransactionWithFeePayerRawTxnRequestArgs {
  feePayerAuthenticator: AccountAuthenticator;
  rawTxn: FeePayerRawTransaction;
}

export type SignAndSubmitTransactionRequestArgs =
  | SignAndSubmitTransactionWithPayloadRequestArgs
  | SignAndSubmitTransactionWithRawTxnRequestArgs
  | SignAndSubmitTransactionWithFeePayerRawTxnRequestArgs;

export interface SerializedSignAndSubmitTransactionWithPayloadRequestArgs {
  options?: TransactionOptions;
  payload: JsonTransactionPayload | string;
}

export interface SerializedSignAndSubmitTransactionWithRawTxnRequestArgs {
  rawTxn: SerializedSimpleRawTransaction;
}

export interface SerializedSignAndSubmitTransactionWithFeePayerRawTxnRequestArgs {
  feePayerAuthenticator: string;
  rawTxn: SerializedFeePayerRawTransaction;
}

export type SerializedSignAndSubmitTransactionRequestArgs =
  | SerializedSignAndSubmitTransactionWithPayloadRequestArgs
  | SerializedSignAndSubmitTransactionWithRawTxnRequestArgs
  | SerializedSignAndSubmitTransactionWithFeePayerRawTxnRequestArgs;

export function serializeSignAndSubmitTransactionRequestArgs(
  args: SignAndSubmitTransactionRequestArgs
): SerializedSignAndSubmitTransactionRequestArgs {
  if ('payload' in args) {
    const serializedPayload = isSerializable(args.payload)
      ? args.payload.bcsToHex().toString()
      : serializeJsonTransactionPayload(args.payload);
    return { options: args.options, payload: serializedPayload };
  }
  if ('feePayerAuthenticator' in args) {
    return {
      feePayerAuthenticator: args.feePayerAuthenticator.bcsToHex().toString(),
      rawTxn: serializeRawTransaction(args.rawTxn)
    };
  }
  if ('rawTxn' in args) {
    return { rawTxn: serializeRawTransaction(args.rawTxn) };
  }
  throw new UnexpectedValueError();
}

export function deserializeSignAndSubmitTransactionRequestArgs(
  args: SerializedSignAndSubmitTransactionWithPayloadRequestArgs
): SignAndSubmitTransactionWithPayloadRequestArgs;
export function deserializeSignAndSubmitTransactionRequestArgs(
  args: SerializedSignAndSubmitTransactionWithRawTxnRequestArgs
): SignAndSubmitTransactionWithRawTxnRequestArgs;
export function deserializeSignAndSubmitTransactionRequestArgs(
  args: SerializedSignAndSubmitTransactionWithFeePayerRawTxnRequestArgs
): SignAndSubmitTransactionWithFeePayerRawTxnRequestArgs;
export function deserializeSignAndSubmitTransactionRequestArgs(
  args: SerializedSignAndSubmitTransactionRequestArgs
): SignAndSubmitTransactionRequestArgs;

export function deserializeSignAndSubmitTransactionRequestArgs(
  args: SerializedSignAndSubmitTransactionRequestArgs
): SignAndSubmitTransactionRequestArgs {
  if ('payload' in args) {
    const payload =
      typeof args.payload === 'string'
        ? bcsDeserialize(TransactionPayload, args.payload)
        : deserializeJsonTransactionPayload(args.payload);
    return { options: args.options, payload };
  }
  if ('feePayerAuthenticator' in args) {
    const deserializedRawTxn = deserializeRawTransaction(args.rawTxn);
    const feePayerAuthenticator = bcsDeserialize(
      AccountAuthenticator,
      args.feePayerAuthenticator
    );
    return { feePayerAuthenticator, rawTxn: deserializedRawTxn };
  }
  if ('rawTxn' in args) {
    const deserializedRawTxn = deserializeRawTransaction(args.rawTxn);
    return { rawTxn: deserializedRawTxn };
  }
  throw new UnexpectedValueError();
}
