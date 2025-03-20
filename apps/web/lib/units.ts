import { z } from "zod";

export const isNumber = (value?: string) => {
  if (value === undefined) return false;
  return z.coerce.number().safeParse(value).success;
};
