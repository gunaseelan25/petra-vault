'use client';

import { useState } from 'react';
import constate from 'constate';
import { EntryFunctionABI } from '@aptos-labs/ts-sdk';

export const [CreateProposalFormProvider, useCreateProposalForm] = constate(
  () => {
    const [entryFunction, setEntryFunction] = useState<string>();

    const [functionArguments, setFunctionArguments] = useState<string[]>([]);

    const [typeArguments, setTypeArguments] = useState<string[]>([]);

    const [abi, setAbi] = useState<EntryFunctionABI | undefined>();

    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    return {
      abi: { value: abi, set: setAbi },
      entryFunction: { set: setEntryFunction, value: entryFunction },
      functionArguments: {
        set: setFunctionArguments,
        value: functionArguments
      },
      typeArguments: { set: setTypeArguments, value: typeArguments },
      isFormValid: { set: setIsFormValid, value: isFormValid }
    };
  }
);
