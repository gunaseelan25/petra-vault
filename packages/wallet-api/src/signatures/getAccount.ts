import { SerializedAccount } from './account';

export interface GetAccountRequestSignature {
  args?: undefined;
  method: 'getAccount';
}

export type GetAccountResponseArgs = SerializedAccount;
