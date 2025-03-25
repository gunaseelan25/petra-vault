"use client";

import { useAccountCoins } from "@aptos-labs/react";
import constate from "constate";
import { useActiveVault } from "./ActiveVaultProvider";
import { CoinMetadata, usePetraCoinsList } from "@/hooks/usePetraCoinsList";
import { useMemo } from "react";
import { usePetraCoinsPrices } from "@/hooks/usePetraPrices";
import { formatUnits, FungibleAssetBalance } from "@aptos-labs/js-pro";
import { hasWindow } from "@/lib/utils";

export interface ProcessedCoin {
  balance: FungibleAssetBalance;
  price?: Record<string, number | null>;
  metadata?: CoinMetadata;
}

export const [CoinsProvider, useCoins] = constate(() => {
  const { vaultAddress, network } = useActiveVault();

  const { data: coinBalances, isLoading: isLoadingCoinBalances } =
    useAccountCoins({
      address: vaultAddress,
      network: { network },
      where: { amount: { _gt: 0 } },
      refetchInterval: 15000,
      enabled: hasWindow(),
    });

  const { data: coinMetadataList, isLoading: isLoadingCoinMetadataList } =
    usePetraCoinsList();

  const { data: coinPrices, isLoading: isLoadingCoinPrices } =
    usePetraCoinsPrices();

  const coins = useMemo((): ProcessedCoin[] | undefined => {
    if (!coinBalances || !coinPrices || !coinMetadataList) return undefined;

    const balances = coinBalances?.pages.flatMap((e) => e.balances);

    const filteredBalances = balances.filter((e) => {
      if (
        e.assetType !== "0x1::aptos_coin::AptosCoin" &&
        (e.metadata.name === "Aptos Coin" || e.metadata.symbol === "APT")
      ) {
        // Filter out any APT scam coins
        return false;
      }

      return true;
    });

    return filteredBalances.map((balance) => {
      const price = coinPrices[balance.metadata.assetType];
      const metadata = coinMetadataList.data.find(
        (e) => e.asset_type === balance.metadata.assetType
      );

      return { balance, price, metadata };
    });
  }, [coinBalances, coinPrices, coinMetadataList]);

  const totalValue = useMemo(() => {
    if (!coins) return undefined;

    const acc = coins.reduce((acc, coin) => {
      if (!coin.price?.usd) return acc;

      acc +=
        Number(
          formatUnits(
            BigInt(coin.balance.amount),
            coin.balance.metadata.decimals
          )
        ) * coin.price.usd;

      return acc;
    }, 0);

    return acc;
  }, [coins]);

  const isLoading =
    isLoadingCoinMetadataList ||
    isLoadingCoinPrices ||
    isLoadingCoinBalances ||
    !hasWindow();

  return { coins, coinMetadataList, coinPrices, totalValue, isLoading };
});
