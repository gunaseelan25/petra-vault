import { AccountAddress, Network } from '@aptos-labs/ts-sdk';
import { VaultSignerSchema } from './signers';
import { z } from 'zod';

const BaseVaultSchema = z.object({
  type: z.string(),
  name: z.string(),
  address: z.instanceof(AccountAddress),
  network: z.nativeEnum(Network)
});
export type BaseVault = z.infer<typeof BaseVaultSchema>;

const FrameworkVaultSchema = BaseVaultSchema.extend({
  type: z.literal('framework'),
  signers: z.array(VaultSignerSchema),
  signaturesRequired: z.number().min(0)
});
export type FrameworkVault = z.infer<typeof FrameworkVaultSchema>;

export const VaultSchema = FrameworkVaultSchema;

export type Vault = z.infer<typeof VaultSchema>;
