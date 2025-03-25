import { formatUnits } from "@aptos-labs/js-pro";
import { z } from "zod";

export const isNumber = (value?: string) => {
  if (value === undefined) return false;
  return z.coerce.number().safeParse(value).success;
};

export const formatBigIntToNumber = (value: bigint, decimals: number) =>
  Number(formatUnits(value, decimals));
