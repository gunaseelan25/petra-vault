import { PetraApiResponseArgs } from './response';
import { SignAndSubmitTransactionRequestArgs } from './serialization';
import { SignAndSubmitTransactionRequestSignature } from './signatures';
import { SignAndSubmitTransactionResponseArgs } from './signatures';

export type ApprovalResponse<ResponseArgs = PetraApiResponseArgs> =
  | { status: 'approved'; args: ResponseArgs }
  | { status: 'dismissed' }
  | { status: 'rejected' | 'timeout' };

export interface ApprovalClient {
  request(request: {
    method: SignAndSubmitTransactionRequestSignature['method'];
    args: SignAndSubmitTransactionRequestArgs;
  }): Promise<ApprovalResponse<SignAndSubmitTransactionResponseArgs>>;
}
