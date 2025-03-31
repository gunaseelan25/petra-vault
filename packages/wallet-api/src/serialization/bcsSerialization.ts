/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Deserializable,
  Deserializer,
  Hex,
  Serializable
} from '@aptos-labs/ts-sdk';

export function isSerializable(value: any): value is Serializable {
  return (
    (value as Serializable)?.serialize !== undefined &&
    (value as Serializable)?.bcsToBytes !== undefined &&
    (value as Serializable)?.bcsToHex !== undefined
  );
}

export function bcsSerialize(value: Serializable): string {
  return value.bcsToHex().toString();
}

export function bcsDeserialize<T>(cls: Deserializable<T>, value: string): T {
  const deserializer = new Deserializer(Hex.fromHexInput(value).toUint8Array());
  return cls.deserialize(deserializer);
}
