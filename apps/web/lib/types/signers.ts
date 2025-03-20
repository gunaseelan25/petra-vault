import { AccountAddress } from "@aptos-labs/ts-sdk";
import { z } from "zod";
import { isAddress } from "../address";

export const VaultSignerSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .refine((val) => isAddress(val), { message: "Invalid Aptos address" })
    .transform((val) => AccountAddress.fromString(val))
    .or(z.instanceof(AccountAddress)),
  name: z.string().min(1, "Name is required"),
});

export type VaultSigner = z.infer<typeof VaultSignerSchema>;
