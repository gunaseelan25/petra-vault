import type { WriteSetChange } from "@aptos-labs/ts-sdk";
import { isWriteResourceChange, normalizeAddress } from "../shared";
import { WritesetParser } from "@/lib/types/parsers";
import { SimulationContext } from "./SimulationParser";

/**
 * Parse changes in fungible stores and populate a map of the store addresses to the contained asset's metadata address.
 * Useful linking fungible store deposits and withdrawals to the contained asset.
 */
export class FungibleAssetStoreWritesetParser implements WritesetParser {
  parseChange(context: SimulationContext, change: WriteSetChange) {
    if (
      !isWriteResourceChange(change) ||
      change.data.type !== "0x1::fungible_asset::FungibleStore"
    ) {
      return false;
    }

    const resource = change.data;

    const storeAddress = normalizeAddress(change.address);
    const { metadata } = resource.data as { metadata: { inner: string } };
    context.fungibleAssetStoreMetadata[storeAddress] = normalizeAddress(
      metadata.inner
    );

    return true;
  }
}
