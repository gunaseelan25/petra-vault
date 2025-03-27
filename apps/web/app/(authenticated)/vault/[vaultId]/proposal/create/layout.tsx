import { CreateProposalFormProvider } from '@/context/CreateProposalFormProvider';
import { PropsWithChildren } from 'react';

export default function CreateProposalLayout({ children }: PropsWithChildren) {
  return <CreateProposalFormProvider>{children}</CreateProposalFormProvider>;
}
