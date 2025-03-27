import { UserTransactionResponse } from '@aptos-labs/ts-sdk';
import { CoinStoreWritesetParser } from './CoinStoreWritesetParser';
import { CoinEventParser } from './CoinEventParser';
import { EventParser } from '@/lib/types/parsers';
import { WritesetParser } from '@/lib/types/parsers';
import { ObjectOwnersWritesetParser } from './ObjectOwnersWritesetParser';
import { FungibleAssetStoreWritesetParser } from './FungibleAssetStoreWritesetParser';
import { FungibleAssetEventParser } from './FungibleAssetEventParser';
import { getPairedMetadata } from '@/lib/fungibleAssets';

export class SimulationContext {
  public coinEventGuidToCoinType: { [eventGuid: string]: string } = {};

  public coinBalanceChanges: {
    [accountAddress: string]: { [coinType: string]: bigint };
  } = {};

  public fungibleAssetBalanceChanges: {
    [accountAddress: string]: { [metadataAddress: string]: bigint };
  } = {};

  public fungibleAssetStoreMetadata: {
    [storeAddress: string]: string;
  } = {};

  public objectOwners: { [objectAddress: string]: string } = {};

  constructor() {
    this.coinEventGuidToCoinType = {};
    this.coinBalanceChanges = {};
    this.fungibleAssetStoreMetadata = {};
    this.objectOwners = {};
  }

  reset() {
    this.coinEventGuidToCoinType = {};
    this.coinBalanceChanges = {};
    this.fungibleAssetStoreMetadata = {};
    this.objectOwners = {};
  }

  /**
   * Get the account balance changes for a given context. Assets will default to `CoinType` if
   * it exists for an asset, otherwise it will default to the metadata address of the fungible
   * asset store.
   */
  getBalanceChanges() {
    const balanceChanges: {
      [address: string]: {
        [asset: string]: {
          delta: bigint;
          coinType: string | undefined;
          faAddress: string;
        };
      };
    } = {};

    Object.entries(this.coinBalanceChanges).forEach(([address, changes]) =>
      Object.entries(changes).forEach(([coinType, delta]) => {
        if (!balanceChanges[address]) balanceChanges[address] = {};
        balanceChanges[address][coinType] = {
          delta,
          coinType,
          faAddress: getPairedMetadata(coinType)
        };
      })
    );

    Object.entries(this.fungibleAssetBalanceChanges).forEach(
      ([address, changes]) =>
        Object.entries(changes).forEach(([faAddress, delta]) => {
          // If the address doesn't have a balance change already, create one.
          if (!balanceChanges[address]) {
            return (balanceChanges[address] = {
              [faAddress]: {
                delta,
                faAddress,
                coinType: undefined
              }
            });
          }

          // If the address already has a balance change for this fungible asset, add the delta to it.
          const pairedCoinBalanceChange = Object.entries(
            balanceChanges[address]
          ).find(([, change]) => change.faAddress === faAddress);

          if (pairedCoinBalanceChange) {
            const [coinType, change] = pairedCoinBalanceChange;
            balanceChanges[address][coinType] = {
              ...change,
              delta: change.delta + delta
            };
          } else {
            balanceChanges[address][faAddress] = {
              delta,
              faAddress,
              coinType: undefined
            };
          }
        })
    );

    return balanceChanges;
  }
}

export default class SimulationParser {
  private static writesetParsers: { [key: string]: WritesetParser } = {
    coinStore: new CoinStoreWritesetParser(),
    objectOwners: new ObjectOwnersWritesetParser(),
    fungibleAssetStore: new FungibleAssetStoreWritesetParser()
  };

  private static eventParsers: { [key: string]: EventParser } = {
    coinEvent: new CoinEventParser(),
    fungibleAssetEvent: new FungibleAssetEventParser()
  };

  static parseTransaction(transaction: UserTransactionResponse) {
    const context = new SimulationContext();

    const writesets = transaction.changes;
    writesets.forEach((writeset) => {
      Object.values(this.writesetParsers).forEach((parser) => {
        parser.parseChange(context, writeset);
      });
    });

    const events = transaction.events;
    events.forEach((event) => {
      Object.values(this.eventParsers).forEach((parser) => {
        parser.parseEvent(context, event);
      });
    });

    return context;
  }
}
