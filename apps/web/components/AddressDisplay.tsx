import { useNameFromAddress } from '@aptos-labs/react';
import {
  AccountAddress,
  AccountAddressInput,
  truncateAddress
} from '@aptos-labs/ts-sdk';

interface AddressDisplayProps {
  address: AccountAddressInput;
  truncate?: boolean;
  disableAnsName?: boolean;
}

export default function AddressDisplay({
  address,
  truncate = true,
  disableAnsName = false
}: AddressDisplayProps) {
  const { data: ansName } = useNameFromAddress({
    address: address ? AccountAddress.from(address) : undefined,
    enabled: !disableAnsName,
    staleTime: 1000 * 60 * 60 * 24 // 24 hours
  });

  return (
    <>
      {ansName?.toString() ??
        (address
          ? truncate
            ? truncateAddress(AccountAddress.from(address).toString())
            : address.toString()
          : undefined)}
    </>
  );
}
