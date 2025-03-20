import { WriteSetChange } from "@aptos-labs/ts-sdk";
import { WritesetParser } from "@/lib/types/parsers";
import { isWriteResourceChange, normalizeAddress } from "../shared";
import { SimulationContext } from "./SimulationParser";

export class ObjectOwnersWritesetParser implements WritesetParser {
  parseChange(context: SimulationContext, change: WriteSetChange) {
    if (
      !isWriteResourceChange(change) ||
      change.data.type !== "0x1::object::ObjectCore"
    ) {
      return false;
    }

    const resource = change.data;

    const objectAddress = normalizeAddress(change.address);
    const { owner } = resource.data as { owner: string };
    context.objectOwners[objectAddress] = normalizeAddress(owner);

    return true;
  }
}
