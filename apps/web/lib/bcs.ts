import {
  AccountAddress,
  Bool,
  Deserializable,
  U256,
  U128,
  U64,
  U32,
  EntryFunctionArgument,
  Hex,
  Serializable,
  TypeTag,
  U16,
  Deserializer,
  U8,
  MoveVector,
} from "@aptos-labs/ts-sdk";

export const deserializerToHex = (deserializer: Deserializer) => {
  return Hex.fromHexInput(
    deserializer.deserializeFixedBytes(deserializer.remaining())
  );
};

export const getTypeTagDeserializerCls = (type: TypeTag) => {
  let cls: Deserializable<Serializable & EntryFunctionArgument> | undefined;

  if (type.isU8()) cls = U8;
  if (type.isU16()) cls = U16;
  if (type.isU32()) cls = U32;
  if (type.isU64()) cls = U64;
  if (type.isU128()) cls = U128;
  if (type.isU256()) cls = U256;
  if (type.isBool()) cls = Bool;
  if (type.isAddress()) cls = AccountAddress;

  return cls;
};

export const formatMoveVectorU8 = (vector: MoveVector<U8>) =>
  Hex.fromHexInput(
    new Uint8Array(vector.values.flatMap((v) => Array.from(v.bcsToBytes())))
  ).toString();
