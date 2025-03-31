import { PetraApiError } from './errors/PetraApiError';
import {
  ConnectResponseArgs,
  GetAccountResponseArgs,
  GetNetworkResponseArgs,
  IsConnectedResponseArgs,
  SignAndSubmitTransactionResponseArgs
} from './signatures';

export type PetraApiResponseArgs =
  | ConnectResponseArgs
  | GetAccountResponseArgs
  | GetNetworkResponseArgs
  | IsConnectedResponseArgs
  | SignAndSubmitTransactionResponseArgs;

export interface BasePetraApiResponse {
  id: string;
  type: 'PetraApiResponse';
}

export type PetraApiSuccessResponse = {
  error: undefined;
  result: PetraApiResponseArgs;
} & BasePetraApiResponse;

export type PetraApiErrorResponse = {
  error: PetraApiError;
  result: undefined;
} & BasePetraApiResponse;

export type PetraApiResponse = PetraApiSuccessResponse | PetraApiErrorResponse;

export function makePetraApiResponse<
  TResponseArgs extends PetraApiResponseArgs
>(id: string, resultOrError: TResponseArgs | PetraApiError): PetraApiResponse {
  const isError = resultOrError instanceof PetraApiError;
  return {
    id,
    type: 'PetraApiResponse',
    ...(isError
      ? { error: resultOrError, result: undefined }
      : { error: undefined, result: resultOrError })
  };
}

/**
 * Check if an object is a PetraApiResponse
 */
export function isPetraApiResponse(
  data?: PetraApiResponse
): data is PetraApiResponse {
  return (
    data !== undefined &&
    data.type === 'PetraApiResponse' &&
    data.id !== undefined &&
    data.id.length > 0
  );
}
