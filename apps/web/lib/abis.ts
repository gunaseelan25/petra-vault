import {
  EntryFunctionABI,
  parseTypeTag,
  TypeTagVector,
} from "@aptos-labs/ts-sdk";

import { TypeTagAddress } from "@aptos-labs/ts-sdk";

import { TypeTagU64 } from "@aptos-labs/ts-sdk";

export const Abis = {
  "0x1::primary_fungible_store::transfer": {
    typeParameters: [{ constraints: [] }],
    parameters: [
      parseTypeTag("0x1::object::Object"),
      new TypeTagAddress(),
      new TypeTagU64(),
    ],
  },
  "0x1::aptos_account::transfer_coins": {
    typeParameters: [{ constraints: [] }],
    parameters: [new TypeTagAddress(), new TypeTagU64()],
  },
  "0x1::multisig_account::add_owners_and_update_signatures_required": {
    parameters: [new TypeTagVector(new TypeTagAddress()), new TypeTagU64()],
    typeParameters: [],
  },
  "0x1::multisig_account::remove_owner": {
    parameters: [new TypeTagAddress()],
    typeParameters: [],
  },
  "0x1::code::publish_package_txn": {
    typeParameters: [],
    parameters: [TypeTagVector.u8(), new TypeTagVector(TypeTagVector.u8())],
  },
} as const satisfies Record<string, EntryFunctionABI>;
