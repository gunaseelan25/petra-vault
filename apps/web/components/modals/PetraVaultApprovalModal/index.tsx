import { Dialog } from '@radix-ui/react-dialog';
import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  ApprovalResponse,
  SignAndSubmitTransactionRequestArgs,
  SignAndSubmitTransactionRequestSignature,
  SignAndSubmitTransactionResponseArgs
} from '@aptos-labs/wallet-api';
import SignAndSubmitTransactionRequestBody from './SignAndSubmitTransactionRequestBody';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PetraVaultApprovalModalProps {}

export interface PetraVaultApprovalModalRef {
  request: (request: {
    method: SignAndSubmitTransactionRequestSignature['method'];
    args: SignAndSubmitTransactionRequestArgs;
  }) => Promise<ApprovalResponse<SignAndSubmitTransactionResponseArgs>>;
}

const PetraVaultApprovalModal = forwardRef<
  PetraVaultApprovalModalRef,
  PetraVaultApprovalModalProps
  // eslint-disable-next-line no-empty-pattern
>(({}, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const [currentRequest, setCurrentRequest] = useState<{
    method: SignAndSubmitTransactionRequestSignature['method'];
    args: SignAndSubmitTransactionRequestArgs;
  } | null>(null);
  const [promiseResolver, setPromiseResolver] = useState<{
    resolve: (
      value: ApprovalResponse<SignAndSubmitTransactionResponseArgs>
    ) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    request: (request) =>
      new Promise((resolve) => {
        setIsOpen(true);
        setCurrentRequest(request);
        setPromiseResolver({ resolve });
      })
  }));

  const handleResolve = (
    response: ApprovalResponse<SignAndSubmitTransactionResponseArgs>
  ) => {
    if (promiseResolver) promiseResolver.resolve(response);
    reset();
  };

  const reset = () => {
    setIsOpen(false);
    setCurrentRequest(null);
    setPromiseResolver(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (promiseResolver) promiseResolver.resolve({ status: 'dismissed' });
        reset();
      }}
    >
      {currentRequest && promiseResolver ? (
        currentRequest.method === 'signAndSubmitTransaction' ? (
          <SignAndSubmitTransactionRequestBody
            request={currentRequest}
            resolve={handleResolve}
          />
        ) : undefined
      ) : undefined}
    </Dialog>
  );
});

PetraVaultApprovalModal.displayName = 'PetraVaultApprovalModal';
export { PetraVaultApprovalModal };
