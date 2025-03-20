import { AccountAddress, Network } from "@aptos-labs/ts-sdk";
import { isAddress } from "./address";
import { Vault } from "./types/vaults";
import { z } from "zod";

export const createVaultId = (vault: Pick<Vault, "network" | "address">) => {
  return `${vault.network}:${vault.address.toString()}`;
};

export const parseVaultId = (vaultId: string) => {
  const [network, address] = vaultId.split(":");
  if (!network || !address) return undefined;

  const networkEnum = z
    .enum(["mainnet", "devnet", "testnet"])
    .safeParse(network);

  const vaultAddress = isAddress(address)
    ? AccountAddress.from(address)
    : undefined;

  if (!networkEnum.success || !vaultAddress) return undefined;

  return { network: networkEnum.data as Network, address: vaultAddress };
};
