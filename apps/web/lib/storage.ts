/* eslint-disable @typescript-eslint/no-explicit-any */

import { AccountAddress } from "@aptos-labs/ts-sdk";

export const storageOptionsSerializers: {
  reviver?: (key: string, value: unknown) => unknown;
  replacer?: (key: string, value: unknown) => unknown;
} = {
  reviver: (key: string, value: any) => {
    if (value?.___type === "AccountAddress") {
      return AccountAddress.fromString(value.value);
    }
    if (value?.___type === "bigint") {
      return BigInt(value.value);
    }
    return value;
  },
  replacer: (key: string, value: any) => {
    if (value instanceof AccountAddress) {
      return { ___type: "AccountAddress", value: value.toString() };
    }
    if (typeof value === "bigint") {
      return { ___type: "bigint", value: value.toString() };
    }
    return value;
  },
};

export const jsonStringify = (value: unknown) => {
  return JSON.stringify(value, storageOptionsSerializers.replacer, 2);
};

export const jsonParse = (value: string) => {
  return JSON.parse(value, storageOptionsSerializers.reviver);
};
