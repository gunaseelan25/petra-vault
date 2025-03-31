import { cn } from '@/lib/utils';
import Callout from './Callout';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export interface ExecuteProposalConfirmationActionsProps {
  actionVariant: 'can-remove' | 'can-execute' | 'waiting' | 'voting';
  className?: string;
  onRemoveTransaction?: () => void;
  onExecuteTransaction?: () => void;
  onVote?: (approve: boolean) => void;
  isPrimaryActionLoading?: boolean;
  isSecondaryActionLoading?: boolean;
  isPrimaryActionDisabled?: boolean;
  hasUserCastedVote?: boolean;
  isUserApproved?: boolean;
}

export default function ExecuteProposalConfirmationActions({
  actionVariant,
  className,
  onRemoveTransaction,
  onVote,
  onExecuteTransaction,
  isPrimaryActionLoading,
  isSecondaryActionLoading,
  isPrimaryActionDisabled,
  hasUserCastedVote,
  isUserApproved
}: ExecuteProposalConfirmationActionsProps) {
  return (
    <div className={cn('grid gap-4 lg:gap-6', className)}>
      {actionVariant === 'voting' && (
        <Callout
          status="error"
          title="Transaction is not ready to be executed"
          description="The transaction does not have enough approvals or rejections. Please cast votes to either reject or approve the transaction."
        />
      )}
      {actionVariant === 'can-remove' && (
        <Callout
          status="error"
          title="Transaction has been rejected"
          description="The transaction has enough rejections to be removed from the sequence."
        />
      )}
      {actionVariant === 'waiting' && (
        <Callout
          status="loading"
          title="Transaction is waiting for execution"
          description="Please execute transactions ahead of the sequence in order to execute this transaction."
        />
      )}
      {actionVariant === 'can-execute' && (
        <Callout
          status="success"
          title="Transaction is ready to be executed"
          description="The transaction has enough approvals and can be executed."
        />
      )}

      <Separator />

      <div className="flex gap-4 max-w-2xl">
        {(!hasUserCastedVote || isUserApproved) && (
          <Button
            variant="outline"
            className="flex-1"
            isLoading={isSecondaryActionLoading}
            onClick={() => onVote?.(false)}
            data-testid="reject-transaction-button"
          >
            Reject
          </Button>
        )}

        {!isUserApproved && (
          <Button
            variant="outline"
            className="flex-1"
            isLoading={isSecondaryActionLoading}
            onClick={() => onVote?.(true)}
            data-testid="approve-transaction-button"
          >
            Approve
          </Button>
        )}

        {hasUserCastedVote &&
          (actionVariant === 'can-execute' ? (
            <Button
              className="flex-1"
              disabled={isPrimaryActionDisabled}
              isLoading={isPrimaryActionLoading}
              onClick={onExecuteTransaction}
              data-testid="execute-transaction-button"
            >
              Execute Transaction
            </Button>
          ) : (
            <Button
              className="flex-1"
              disabled={isPrimaryActionDisabled}
              isLoading={isPrimaryActionLoading}
              onClick={onRemoveTransaction}
              data-testid="remove-transaction-button"
            >
              Remove Transaction
            </Button>
          ))}
      </div>
    </div>
  );
}
