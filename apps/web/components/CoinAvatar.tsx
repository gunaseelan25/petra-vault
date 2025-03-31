import { ProcessedCoin } from '@/context/CoinsProvider';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from './ui/avatar';
import { AptosCoinAvatar } from 'aptos-avatars-react';
import { cn } from '@/lib/utils';
import { isApt } from '@/lib/address';
import { cva } from 'class-variance-authority';

export type CoinAvatarProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
} & (
  | {
      coin: ProcessedCoin;
    }
  | {
      asset: string;
      logoUrl?: string;
      fallbackUrl?: string;
    }
);

export default function CoinAvatar({
  className,
  size = 'md',
  ...props
}: CoinAvatarProps) {
  const asset =
    'coin' in props ? props.coin.balance.metadata.assetType : props.asset;

  const logoUrl = isApt(asset)
    ? '/aptos_coin.svg'
    : 'coin' in props
      ? (props.coin.metadata?.logo_url ?? props.coin.balance.metadata.iconUri)
      : (props.logoUrl ?? props.fallbackUrl);

  const sizeClass = cva('', {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-6 h-6 md:w-8 md:h-8',
        lg: 'w-8 h-8 md:w-10 md:h-10'
      }
    },
    defaultVariants: { size: 'md' }
  });

  return (
    <Avatar className={cn(sizeClass({ size }), className)}>
      <AvatarFallback
        className={cn(
          'aspect-square [&>div]:!bg-transparent',
          sizeClass({ size }),
          className
        )}
      >
        <AptosCoinAvatar
          value={asset}
          size={size === 'sm' ? 16 : size === 'md' ? 32 : 40}
        />
      </AvatarFallback>
      {logoUrl && <AvatarImage src={logoUrl} />}
    </Avatar>
  );
}
