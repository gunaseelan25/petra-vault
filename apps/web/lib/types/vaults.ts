import { AccountAddress, Network } from '@aptos-labs/ts-sdk';
import { VaultSignerSchema } from './signers';
import { z } from 'zod';

export const VaultNameSchema = z
  .string()
  .min(2, {
    message: 'The name must be at least 2 characters.'
  })
  .max(50, {
    message: 'The name cannot exceed 50 characters.'
  })
  .regex(/^[A-Za-z0-9 _-]{2,50}$/, {
    message:
      'Name can only contain letters, numbers, spaces, hyphens, and underscores.'
  });

export type VaultName = z.infer<typeof VaultNameSchema>;

const BaseVaultSchema = z.object({
  type: z.string(),
  name: VaultNameSchema,
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
