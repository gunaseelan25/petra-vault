import {
  EntryFunctionABI,
  EntryFunctionArgumentTypes,
  Hex,
  isEncodedEntryFunctionArgument,
  MoveVector,
  parseTypeTag,
  SimpleEntryFunctionArgumentTypes,
  TypeTagVector
} from '@aptos-labs/ts-sdk';

import { TypeTagAddress } from '@aptos-labs/ts-sdk';

import { TypeTagU64 } from '@aptos-labs/ts-sdk';

export const Abis = {
  '0x1::primary_fungible_store::transfer': {
    typeParameters: [{ constraints: [] }],
    parameters: [
      parseTypeTag('0x1::object::Object'),
      new TypeTagAddress(),
      new TypeTagU64()
    ]
  },
  '0x1::aptos_account::transfer_coins': {
    typeParameters: [{ constraints: [] }],
    parameters: [new TypeTagAddress(), new TypeTagU64()]
  },
  '0x1::multisig_account::add_owners_and_update_signatures_required': {
    parameters: [new TypeTagVector(new TypeTagAddress()), new TypeTagU64()],
    typeParameters: []
  },
  '0x1::multisig_account::remove_owner': {
    parameters: [new TypeTagAddress()],
    typeParameters: []
  },
  '0x1::code::publish_package_txn': {
    typeParameters: [],
    parameters: [TypeTagVector.u8(), new TypeTagVector(TypeTagVector.u8())]
  }
} as const satisfies Record<string, EntryFunctionABI>;

export const preprocessArgs = (
  args: SimpleEntryFunctionArgumentTypes[],
  abi: EntryFunctionABI
) => {
  return args.map((arg, i) => {
    const typeTag = abi.parameters[i];

    if (!typeTag) throw new Error('TypeTag when pre-processing arguments');

    if (typeTag.isVector()) {
      return preprocessVector(arg, typeTag);
    }

    return arg;
  });
};

const preprocessVector = (
  arg: SimpleEntryFunctionArgumentTypes | EntryFunctionArgumentTypes,
  typeTag: TypeTagVector
): SimpleEntryFunctionArgumentTypes | EntryFunctionArgumentTypes => {
  if (!Array.isArray(arg)) {
    throw new Error('Argument is not an array when pre-processing vector');
  }

  if (typeTag.value.isU8()) {
    if (
      Array.isArray(arg) &&
      arg.every((a) => typeof a === 'string' && Hex.isValid(a).valid)
    ) {
      // If the argument is a vector of Hex strings, concat the array of values. This is a workaround to the fact that the SDK
      // serializes strings as UTF-8 as opposed to Hex.
      return MoveVector.U8(
        arg.flatMap((a) =>
          Array.from(Hex.fromHexInput(a as string).toUint8Array())
        )
      );
    }
  }

  if (typeTag.value.isVector()) {
    return new MoveVector(
      arg.map((a) => {
        const processedArg = preprocessVector(
          a,
          typeTag.value as TypeTagVector
        );

        if (isEncodedEntryFunctionArgument(processedArg)) {
          return processedArg;
        }

        throw new Error('Unsupported argument when pre-processing vector');
      })
    );
  }

  return arg;
};
