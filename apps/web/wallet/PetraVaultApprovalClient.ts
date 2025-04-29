import { PetraVaultApprovalModalRef } from '@/components/modals/PetraVaultApprovalModal';
import {
  ApprovalClient,
  ApprovalResponse,
  SignAndSubmitTransactionRequestArgs,
  SignAndSubmitTransactionResponseArgs,
  SignAndSubmitTransactionRequestSignature,
  PetraApiResponseArgs
} from '@aptos-labs/wallet-api';
import { RefObject } from 'react';

export class PetraVaultApprovalClient implements ApprovalClient {
  private resolutionQueue: Promise<ApprovalResponse> | null = null;

  constructor(
    readonly approvalModalRef: RefObject<PetraVaultApprovalModalRef | null>
  ) {}

  private async enqueueRequest<T extends PetraApiResponseArgs>(
    callback: () => Promise<ApprovalResponse<T>>
  ) {
    const waiterPromise =
      this.resolutionQueue?.catch(() => undefined) ?? Promise.resolve();
    const newRequestPromise = waiterPromise.then(callback);
    this.resolutionQueue = newRequestPromise;
    return newRequestPromise;
  }

  async request(request: {
    method: SignAndSubmitTransactionRequestSignature['method'];
    args: SignAndSubmitTransactionRequestArgs;
  }): Promise<ApprovalResponse<SignAndSubmitTransactionResponseArgs>> {
    return await this.enqueueRequest(() => {
      if (!this.approvalModalRef.current) {
        throw new Error('Approval modal not found');
      }
      return this.approvalModalRef.current.request(request);
    });
  }
}
