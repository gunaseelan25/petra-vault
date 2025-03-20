import { TypeTag, TypeTagVector } from "@aptos-labs/ts-sdk";
import { z, ZodTypeAny } from "zod";
import { isAddress } from "./address";

export const arrayFromString = <T extends ZodTypeAny>(schema: T) => {
  return z.preprocess((obj: unknown) => {
    if (!obj) {
      return [];
    }
    if (Array.isArray(obj)) {
      return obj;
    }
    if (typeof obj === "string") {
      return JSON.parse(obj);
    }

    return [];
  }, z.array(schema));
};

export const transformTypeTagToZod = (typeTag: TypeTag): ZodTypeAny => {
  if ((typeTag as TypeTag).isAddress()) {
    return z.string().refine((val) => isAddress(val), {
      message: "Invalid Aptos address",
    });
  }

  if (
    (typeTag as TypeTag).isU64() ||
    (typeTag as TypeTag).isU128() ||
    (typeTag as TypeTag).isU256()
  ) {
    return z.coerce.number().int().nonnegative();
  }

  if ((typeTag as TypeTag).isBool()) {
    return z.enum(["true", "false"]).transform((value) => value === "true");
  }

  if ((typeTag as TypeTag).isVector()) {
    return arrayFromString(
      transformTypeTagToZod((typeTag as TypeTagVector).value)
    );
  }

  return z.string().min(1);
};

export const getTypeTagDefaultZodValue = (typeTag: TypeTag): unknown => {
  if ((typeTag as TypeTag).isVector()) {
    return [];
  }

  if (
    (typeTag as TypeTag).isU64() ||
    (typeTag as TypeTag).isU128() ||
    (typeTag as TypeTag).isU256()
  ) {
    return "0";
  }

  return "";
};
