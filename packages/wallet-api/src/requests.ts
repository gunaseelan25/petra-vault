import {
  ConnectRequestSignature,
  GetAccountRequestSignature,
  GetNetworkRequestSignature,
  IsConnectedRequestSignature,
  SignAndSubmitTransactionRequestSignature
} from './signatures';

export type PetraVaultApiRequestSignature =
  | ConnectRequestSignature
  | GetAccountRequestSignature
  | GetNetworkRequestSignature
  | IsConnectedRequestSignature
  | SignAndSubmitTransactionRequestSignature;

export type PetraVaultApiRequest = PetraVaultApiRequestSignature & {
  id: string;
  type: 'PetraVaultApiRequest';
};

export function makePetraVaultApiRequest(
  id: string,
  signature: PetraVaultApiRequestSignature
): PetraVaultApiRequest {
  return { ...signature, id, type: 'PetraVaultApiRequest' };
}

export function isPetraVaultApiRequest(
  value?: PetraVaultApiRequest
): value is PetraVaultApiRequest {
  return (
    value !== undefined &&
    value.type === 'PetraVaultApiRequest' &&
    value.id !== undefined &&
    value.id.length >= 0 &&
    value.method !== undefined
  );
}
