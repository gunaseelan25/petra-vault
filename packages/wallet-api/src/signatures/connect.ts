import { SerializedAccount } from './account';

export interface ConnectRequestSignature {
  args?: undefined;
  method: 'connect';
}

export type ConnectResponseArgs = SerializedAccount;
