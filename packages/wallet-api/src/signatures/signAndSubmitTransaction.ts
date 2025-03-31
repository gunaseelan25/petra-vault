import { SerializedSignAndSubmitTransactionRequestArgs } from '../serialization/signAndSubmitTransaction';

export interface SignAndSubmitTransactionRequestSignature {
  args: SerializedSignAndSubmitTransactionRequestArgs;
  method: 'signAndSubmitTransaction';
}

export type SignAndSubmitTransactionResponseArgs = { hash: string };
