import type { Event } from "@aptos-labs/ts-sdk";
import { normalizeAddress, serializeEventGuid } from "../shared";
import { EventParser } from "@/lib/types/parsers";
import { SimulationContext } from "./SimulationParser";

export class CoinEventParser implements EventParser {
  private applyChange(
    context: SimulationContext,
    accountAddress: string,
    amount: bigint,
    opts: { creationNum: string } | { coinType: string }
  ) {
    let coinType: string;
    if ("creationNum" in opts) {
      const eventGuid = serializeEventGuid(accountAddress, opts.creationNum);
      if (!context.coinEventGuidToCoinType[eventGuid]) return;
      coinType = context.coinEventGuidToCoinType[eventGuid];
    } else {
      coinType = opts.coinType;
    }

    const coinBalanceChanges = context.coinBalanceChanges[accountAddress] ?? {};

    if (!coinBalanceChanges[coinType]) {
      coinBalanceChanges[coinType] = amount;
    } else {
      coinBalanceChanges[coinType]! += amount;
    }

    context.coinBalanceChanges[accountAddress] = coinBalanceChanges;
  }

  parseEvent(context: SimulationContext, event: Event) {
    switch (event.type) {
      case "0x1::coin::DepositEvent": {
        const accountAddress = normalizeAddress(event.guid.account_address);
        this.applyChange(context, accountAddress, BigInt(event.data.amount), {
          creationNum: event.guid.creation_number,
        });
        return true;
      }
      case "0x1::coin::WithdrawEvent": {
        const accountAddress = normalizeAddress(event.guid.account_address);
        this.applyChange(context, accountAddress, -BigInt(event.data.amount), {
          creationNum: event.guid.creation_number,
        });
        return true;
      }
      case "0x1::coin::CoinDeposit": {
        const accountAddress = normalizeAddress(event.data.account);
        this.applyChange(context, accountAddress, BigInt(event.data.amount), {
          coinType: event.data.coin_type,
        });
        return true;
      }
      case "0x1::coin::CoinWithdraw": {
        const accountAddress = normalizeAddress(event.data.account);
        this.applyChange(context, accountAddress, -BigInt(event.data.amount), {
          coinType: event.data.coin_type,
        });
        return true;
      }
      default:
        return false;
    }
  }
}
