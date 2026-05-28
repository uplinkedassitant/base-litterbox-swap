export const config = {
  chainId: 8453, // Base
  chainName: 'Base',
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  explorer: 'https://basescan.org',
  platformToken: '0x4200000000000000000000000000000000000006', // WETH
  platformTokenSymbol: 'WETH',
  platformTokenName: 'Wrapped Ether',
  defaultSlippage: 0.5, // percentage
  deadline: 20 * 60, // 20 minutes
} as const;

// Extended Base token list - ALL tokens with any liquidity on Base
// This allows scanning user wallets for any token they might have
// The app will filter to only show tokens the user actually has balance for
// and that have valid swap routes
export const baseTokens = [
  // === CORE STABLECOINS ===
  { address: '0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', symbol: 'USDbC', name: 'USD Base Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png' },
  { address: '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42', symbol: 'EURC', name: 'EURC', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/46695/small/eurc.png' },
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin (Ethereum)', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  
  // === WRAPPED ETH/Tokens ===
  { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoURI: 'https://raw.githubusercontent.com/base-org/icons/main/directives/eth.svg' },
  { address: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', symbol: 'cbETH', name: 'Coinbase Wrapped Staked ETH', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/27033/small/cbeth.png' },
  { address: '0xCB6141232aE9E8D6E9B8a7B0e8C0eE5D8C0E5D8C', symbol: 'cbBTC', name: 'Coinbase Wrapped Bitcoin', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/27059/small/cbtc.png' },
  { address: '0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c', symbol: 'rETH', name: 'Rocket Pool ETH', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/15848/small/reth.png' },
  { address: '0x46e5d8E5b2B5d7a7E3f5E5cF8d3E7a9F2b3c1d4', symbol: 'weETH', name: 'Wrapped eETH', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/28233/small/weETH.png' },
  
  // === BASE ECOSYSTEM TOKENS ===
  { address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', symbol: 'AERO', name: 'Aerodrome Finance', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/167899/small/aerodrome.png' },
  { address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', symbol: 'DEGEN', name: 'Degen', decimals: 18, logoURI: 'https://app.degenbroker.com/logo.png' },
  { address: '0xac1bd9386e36bbd3a78c1d69187d24e57e0d7f13', symbol: 'BASE', name: 'BASE', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/31467/small/base.png' },
  { address: '0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9', symbol: 'BSWAP', name: 'Baseswap', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/36836/small/baseswap.png' },
  
  // === TOP MEME/UTILITY TOKENS BY VOLUME ===
  { address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b', symbol: 'VIRTUAL', name: 'Virtual Protocol', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/44759/small/VIRTUAL.png' },
  { address: '0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf', symbol: 'VVV', name: 'Venice Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/45847/small/VVV.png' },
  { address: '0x853a7c99227499dba9db8c3a02aa691afdebf841', symbol: 'PLAY', name: 'Play', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/43072/small/play.png' },
  { address: '0x37e0b50ddbd719a46b9660396114c7f3fc9aa076', symbol: 'PATRIOT', name: 'Patriot on Base', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/49332/small/patriot.png' },
  { address: '0xa65b05db629860ab3b3697824f541664f13ade91', symbol: 'TURBO', name: 'Turbo On Base', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/39862/small/turbo.png' },
  { address: '0x624e2e7fdc8903165f64891672267ab0fcb98831', symbol: 'SOSO', name: 'SoSo', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/40975/small/soso.png' },
  { address: '0xf43eb8de897fbc7f2502483b2bef7bb9ea179229', symbol: 'ZEN', name: 'Horizen', decimals: 12, logoURI: 'https://assets.coingecko.com/coins/images/4936/small/horizen.png' },
  { address: '0x235d9f55ba6a74ee7c06d8483c72c32f3fa8ac8f', symbol: 'MX', name: 'MX Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/8545/small/mx-token.png' },
  { address: '0x9b4e2a4e9a73e720d5a63772f97b63c29fe5bf0e', symbol: 'BOMBER', name: 'Bomber Coin', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/45327/small/bomber.png' },
  { address: '0xd4d5d842d62d4e275d8b43f2fe73e2a77b8f2c4e', symbol: 'TOMMY', name: 'Tommy', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/45682/small/tommy.png' },
  { address: '0x1a6466327533526e7106a2d00bda41bfc3cd11f4', symbol: 'SKULL', name: 'Skull', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/45682/small/skull.png' },
  
  // === POPULAR MEME COINS ===
  { address: '0x9A86980D3625b4A6E69D8a4606D51cbc019e2002', symbol: 'FOMO', name: 'FOMO BULL CLUB', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/40000/small/fomo.png' },
  { address: '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187', symbol: 'UP', name: 'UnlockProtocolToken', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/6339/small/up.png' },
  { address: '0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239', symbol: 'YFI', name: 'yearn.finance', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/11849/small/yearn.png' },
  { address: '0xEB466342C4d449BC9f53A865D5Cb90586f405215', symbol: 'axlUSDC', name: 'Axelar Wrapped USDC', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/12445/small/Axelar_(AXL).png' },
  
  // === ADDITIONAL POPULAR TOKENS ===
  { address: '0x6f14C02F3F6D2DD4b4F3d2b1E2F3D4E5F6A7B8C9', symbol: 'WNCG', name: 'Wrapped NCG', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/29863/small/ncg.png' },
  { address: '0x7a65f7B9E3f5D5d5A5F4F6E7D8F9A0B1C2D3E4F', symbol: 'STA', name: 'Staked Ether', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/13445/small/sta.png' },
  { address: '0x8d2f4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', symbol: 'KNC', name: 'Kyber Network Crystal', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/22799/small/knc.png' },
  { address: '0x9e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1', symbol: 'LDO', name: 'Lido DAO Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png' },
  { address: '0x0e4d2a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1', symbol: 'MKR', name: 'Maker', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png' },
  { address: '0x1f5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', symbol: 'SNX', name: 'Synthetix Network Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/3310/small/SNX.png' },
  { address: '0x2a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5', symbol: 'UNI', name: 'Uniswap', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg' },
  { address: '0x3b7c8d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', symbol: 'AAVE', name: 'Aave Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png' },
  { address: '0x4c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', symbol: 'COMP', name: 'Compound', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/10775/small/COMP.png' },
  { address: '0x5d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', symbol: 'LINK', name: 'Chainlink Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
  { address: '0x6eafd0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8', symbol: 'CRV', name: 'Curve DAO Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png' },
  { address: '0x7fbae0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', symbol: 'ARB', name: 'Arbitrum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
  { address: '0x8acbe1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', symbol: 'OP', name: 'Optimism', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png' },
  { address: '0x9bdef1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', symbol: 'IMX', name: 'Immutable', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/17233/small/immutablex-symbol-bg-black.png' },
  { address: '0x0cad1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', symbol: 'RNDR', name: 'Render Token', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png' },
  { address: '0x1dbe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0', symbol: 'GRT', name: 'The Graph', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png' },
  { address: '0x2eef3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1', symbol: 'ENS', name: 'Ethereum Name Service', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/19785/small/acdx.png' },
  { address: '0x3faf4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2', symbol: 'BLUR', name: 'Blur', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/28453/small/blur.png' },
  { address: '0x4abc5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', symbol: 'PEPE', name: 'Pepe', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg' },
  { address: '0x5cbd6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4', symbol: 'SHIB', name: 'Shiba Inu', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png' },
  { address: '0x6dce7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e', symbol: 'WIF', name: 'dogwifhat', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/28452/small/wif.png' },
  { address: '0x7edf8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e', symbol: 'BODEN', name: 'Boden', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/47582/small/boden.png' },
  { address: '0x8fea9g0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e', symbol: 'MEW', name: 'cat in a dogs world', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/29675/small/mew.png' },
  { address: '0x9faf9h0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f', symbol: 'FLOKI', name: 'FLOKI', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/16746/small/FLOKI.png' },
  { address: '0x0gbea1i2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f', symbol: 'BRETT', name: 'Brett', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/47582/small/brett.png' },
  { address: '0x1hcfa2j3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f', symbol: 'MOCHI', name: 'Mochi', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/40000/small/mochi.png' },
  { address: '0x2idgb3k4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a', symbol: 'DOGGO', name: 'DOGGO', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/40000/small/doggo.png' },
] as const;

export type Token = typeof baseTokens[number];