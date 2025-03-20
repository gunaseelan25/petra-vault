import { useCoins } from "@/context/CoinsProvider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AptosCoinAvatar } from "aptos-avatars-react";
import { cn } from "@/lib/utils";
import { formatUnits } from "@aptos-labs/js-pro";
import { useFungibleAssetMetadata } from "@aptos-labs/react";
import { useActiveVault } from "@/context/ActiveVaultProvider";

interface SimulationCoinRowProps {
  asset: string;
  delta: bigint;
}

export default function SimulationCoinRow({
  asset,
  delta,
}: SimulationCoinRowProps) {
  const { network } = useActiveVault();

  const { coinMetadataList, coinPrices } = useCoins();

  const coinMetadata = coinMetadataList?.data.find(
    (e) => e.asset_type === asset
  );

  const coinPrice = coinPrices?.[asset];

  const { data: faMetadata } = useFungibleAssetMetadata({
    asset,
    network: { network },
    enabled: coinMetadata === undefined,
  });

  const metadata = {
    name: coinMetadata?.name ?? faMetadata?.name ?? undefined,
    symbol: coinMetadata?.symbol ?? faMetadata?.symbol ?? undefined,
    logoUrl: coinMetadata?.logo_url ?? faMetadata?.iconUri ?? undefined,
    decimals: coinMetadata?.decimals ?? faMetadata?.decimals ?? 8,
    price: coinPrice?.usd,
  };

  const formattedDelta = formatUnits(delta, metadata.decimals);
  const assetValue = metadata.price
    ? metadata.price * Number(formattedDelta)
    : null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={metadata.logoUrl} />
          <AvatarFallback>
            <AptosCoinAvatar value={asset} />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-display">{metadata.name}</p>
          <p className="text-xs text-muted-foreground">{metadata.symbol}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div
          className={cn(
            "font-display",
            delta > 0n ? "text-green-600" : "text-red-600"
          )}
        >
          {delta > 0n ? "+" : ""}
          {formatUnits(delta, metadata.decimals)} {metadata.symbol}
        </div>
        <div className="text-xs text-muted-foreground">
          {assetValue ? <p>${Math.abs(assetValue).toFixed(2)}</p> : null}
        </div>
      </div>
    </div>
  );
}
