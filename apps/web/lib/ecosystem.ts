// TODO: Migrate to ecosystem lists API
export const ecosystemApps = [
  {
    categories: ['defi', 'liquidStaking'],
    platform: ['mobile', 'extension', 'web'],
    type: 'dapp',
    description: 'Liquidity Staking Protocol on Aptos',
    isPopular: true,
    link: 'https://stake.amnis.finance/',
    logoUrl:
      'https://media.aptosfoundation.org/1697740121-project-icon_amnis.png?auto=format&fit=crop&h=100&w=100',
    logoUrlDark:
      'https://media.aptosfoundation.org/1697740121-project-icon_amnis.png?auto=format&fit=crop&h=100&w=100',
    name: 'Amnis Finance',
    supportsAptosConnect: true,
    tester: 'amnis'
  },
  {
    categories: ['defi', 'entertainment'],
    platform: ['mobile', 'extension', 'web'],
    type: 'dapp',
    description: 'Presented by Econia Labs',
    isPopular: true,
    link: 'https://www.emojicoin.fun/',
    logoUrl:
      'https://imagedelivery.net/1v0lk1OFEOmesBikJtB8QQ/568a0e52-57fc-4910-1e5e-38663b8dd400/small100x100',
    logoUrlDark:
      'https://imagedelivery.net/1v0lk1OFEOmesBikJtB8QQ/568a0e52-57fc-4910-1e5e-38663b8dd400/small100x100',
    name: 'EmojiCoin.fun',
    supportsAptosConnect: true,
    tester: 'emojicoin'
  },
  {
    categories: ['defi', 'stablecoins', 'launchpads'],
    platform: ['mobile', 'extension', 'web'],
    type: 'dapp',
    description: 'DeFi App – Powered by Move, Now Live on Aptos',
    isPopular: false,
    link: 'https://app.thala.fi/',
    logoUrl:
      'https://media.aptosfoundation.org/1687178238-thala-launch.jpeg?auto=format&fit=crop&h=100&w=100',
    logoUrlDark:
      'https://media.aptosfoundation.org/1687178238-thala-launch.jpeg?auto=format&fit=crop&h=100&w=100',
    name: 'Thala Labs',
    supportsAptosConnect: true,
    tester: 'thala'
  },
  {
    categories: ['defi', 'bridges'],
    platform: ['mobile', 'extension', 'web'],
    type: 'dapp',
    description: 'Cross-chain aggregator',
    isPopular: false,
    link: 'https://www.okx.com/web3/dex-swap#inputChain=637&inputCurrency=APT&outputChain=637&outputCurrency=0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC',
    logoUrl:
      'https://media.aptosfoundation.org/1699066253-project-icon_okx-dex.png?auto=format&fit=crop&h=100&w=100',
    logoUrlDark:
      'https://media.aptosfoundation.org/1699066253-project-icon_okx-dex.png?auto=format&fit=crop&h=100&w=100',
    name: 'OKX DEX',
    tester: 'okx.com'
  },
  {
    categories: ['defi', 'swaps'],
    platform: ['mobile', 'extension', 'web'],
    type: 'dapp',
    description: 'App for DeFi. Building the Future of web3',
    isPopular: false,
    link: 'https://app.kanalabs.io/',
    logoUrl:
      'https://media.aptosfoundation.org/1690445358-e55899f0b363-kanalabs_logo.png?auto=format&fit=crop&h=100&w=100',
    logoUrlDark:
      'https://media.aptosfoundation.org/1690445358-e55899f0b363-kanalabs_logo.png?auto=format&fit=crop&h=100&w=100',
    name: 'Kana Labs',
    supportsAptosConnect: true,
    tester: 'kanalabs'
  },
  {
    categories: ['defi', 'lending'],
    description: 'Universal lending market connecting liquidity on Aptos',
    isPopular: false,
    link: 'https://echelon.market/',
    logoUrl:
      'https://imagedelivery.net/1v0lk1OFEOmesBikJtB8QQ/7ae9dda7-8964-4f18-bdcf-cf171e49fd00/small100x100',
    logoUrlDark:
      'https://imagedelivery.net/1v0lk1OFEOmesBikJtB8QQ/7ae9dda7-8964-4f18-bdcf-cf171e49fd00/small100x100',
    name: 'Echelon',
    tester: 'echelon'
  }
] as const;
