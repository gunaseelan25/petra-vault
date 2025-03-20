"use client";

import { PropsWithChildren } from "react";
import { ActiveProposalProvider } from "@/context/ActiveProposalProvider";
import { useParams } from "next/navigation";
import { isNumber } from "@/lib/units";

export default function ProposalLayout({ children }: PropsWithChildren) {
  const { sequenceNumber } = useParams();

  if (
    !sequenceNumber ||
    Array.isArray(sequenceNumber) ||
    !isNumber(sequenceNumber)
  ) {
    return <div>Invalid sequence number</div>;
  }

  return (
    <ActiveProposalProvider sequenceNumber={Number(sequenceNumber)}>
      {children}
    </ActiveProposalProvider>
  );
}
