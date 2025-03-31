import { ArrowLeftIcon } from 'lucide-react';
import Callout from './Callout';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

interface CreateProposalConfirmationActionsProps {
  onBack: () => void;
  onCreateProposal: () => void;
  isLoading: boolean;
  className?: string;
}

export default function CreateProposalConfirmationActions({
  onBack,
  onCreateProposal,
  isLoading,
  className
}: CreateProposalConfirmationActionsProps) {
  return (
    <div className={cn('grid gap-6', className)}>
      <Callout
        title="Always Verify"
        description="Before signing, always verify the transaction details and the transaction payload."
        status="loading"
      />
      <Separator />
      <div className="flex gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeftIcon />
          Go Back
        </Button>
        <Button
          onClick={onCreateProposal}
          isLoading={isLoading}
          data-testid="create-proposal-button"
        >
          Create Proposal
        </Button>
      </div>
    </div>
  );
}
