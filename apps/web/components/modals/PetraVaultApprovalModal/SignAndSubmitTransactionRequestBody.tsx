import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ApprovalResponse,
  SignAndSubmitTransactionRequestArgs,
  SignAndSubmitTransactionRequestSignature,
  SignAndSubmitTransactionResponseArgs,
  TransactionOptions
} from '@aptos-labs/wallet-api';
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk';
import SignAndSubmitTransactionWithPayloadBody from './SignAndSubmitTransactionWithPayloadBody';
import { useSignAndSubmitTransaction } from '@aptos-labs/react';
import useAnalytics from '@/hooks/useAnalytics';

interface SignAndSubmitTransactionRequestBodyProps {
  request: {
    method: SignAndSubmitTransactionRequestSignature['method'];
    args: SignAndSubmitTransactionRequestArgs;
  };
  resolve: (
    args: ApprovalResponse<SignAndSubmitTransactionResponseArgs>
  ) => void;
}

export default function SignAndSubmitTransactionRequestBody({
  request,
  resolve
}: SignAndSubmitTransactionRequestBodyProps) {
  const trackEvent = useAnalytics();

  const { signAndSubmitTransactionAsync, isPending } =
    useSignAndSubmitTransaction();

  const onHandleReject = () => {
    trackEvent('sign_and_submit_transaction_rejected', {});
    resolve({ status: 'rejected' });
  };

  const onHandleApprove = async (transactionPayload: {
    data: InputGenerateTransactionPayloadData;
    options?: TransactionOptions;
  }) => {
    const { hash } = await signAndSubmitTransactionAsync({
      ...transactionPayload
    });

    trackEvent('sign_and_submit_transaction_approved', { hash });
    resolve({ status: 'approved', args: { hash } });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Propose Transaction</DialogTitle>
        <DialogDescription>
          This proposal will create a new transaction that can be executed by
          the vault.
        </DialogDescription>
      </DialogHeader>

      {'payload' in request.args && (
        <SignAndSubmitTransactionWithPayloadBody
          args={request.args}
          onApprove={onHandleApprove}
          onReject={onHandleReject}
          isApproving={isPending}
        />
      )}
    </DialogContent>
  );
}
