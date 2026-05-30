import { http, createPublicClient } from 'viem';
import { base } from 'viem/chains';

// DEX Router Addresses on Base
export const DEX_ROUTERS = {
  aerodrome: '0x6Cb442acF35158D5eDa88fe602221b67B400Be3E',
  baseswap: '0x327Df1E6D0586d73D5E2C94E5B49dA11EDd3F3b6',
} as const;

// Token ABI
const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'symbol', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'name', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'decimals', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
] as const;

export const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

// Alchemy API key for token scanning
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Alchemy API URL
const getAlchemyUrl = () => {
  if (!ALCHEMY_API_KEY) {
    console.warn('Alchemy API key not configured. Set NEXT_PUBLIC_ALCHEMY_API_KEY in .env.local');
    return null;
  }
  return `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
};

// Get token metadata from on-chain
async function getTokenMetadata(tokenAddress: string, client: any) {
  try {
    const [symbol, name, decimals] = await Promise.all([
      client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'symbol' }),
      client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'name' }),
      client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'decimals' }),
    ]);
    return { symbol: String(symbol), name: String(name), decimals: Number(decimals) };
  } catch {
    return { symbol: '???', name: 'Unknown', decimals: 18 };
  }
}

// Scan wallet tokens using Alchemy API
export async function scanWalletTokensWithAlchemy(
  walletAddress: string
): Promise<Array<{
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUsd: number;
  hasLiquidity: boolean;
}>> {
  const alchemyUrl = getAlchemyUrl();
  if (!alchemyUrl) return [];

  try {
    const response = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [walletAddress, 'erc20'],
      }),
    });

    const data = await response.json();
    
    if (!data.result || !data.result.tokenBalances) {
      console.error('Alchemy returned no results');
      return [];
    }

    const tokens = data.result.tokenBalances.filter(
      (t: any) => t.tokenId && t.balance && BigInt(t.balance) > BigInt(0)
    );

    // Fetch metadata for each token in parallel
    const tokensWithMeta = await Promise.all(
      tokens.map(async (t: any) => {
        const address = t.tokenId;
        const balance = BigInt(t.balance);
        const meta = await getTokenMetadata(address, baseClient);

        return {
          address,
          symbol: meta.symbol,
          name: meta.name,
          decimals: meta.decimals,
          balance: balance.toString(),
          balanceUsd: 0,
          hasLiquidity: true, // Assume all Alchemy tokens have some activity
        };
      })
    );

    console.log(`Alchemy scan found ${tokensWithMeta.length} tokens`);
    return tokensWithMeta;
  } catch (e) {
    console.error('Alchemy scan error:', e);
    return [];
  }
}

// Fallback: scan via on-chain events (slower but works without Alchemy)
export async function scanWalletTokensFallback(
  walletAddress: string,
  client: any
): Promise<Array<{
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUsd: number;
  hasLiquidity: boolean;
}>> {
  const userAddress = walletAddress.toLowerCase();
  const foundTokens = new Map<string, any>();

  // Use public Alchemy for token list (no API key needed for this endpoint)
  try {
    const response = await fetch('https://base-mainnet.g.alchemy.com/v2/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenMetadata',
        params: ['0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913'], // USDC as test
      }),
    });
    
    // If this works, we can use the API
    console.log('Alchemy API accessible');
  } catch {
    console.log('Using fallback on-chain scan');
  }

  // Check common Base tokens for balance as fallback
  const commonTokens = [
    '0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913', // USDC
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDbC
    '0x4200000000000000000000000000000000000006', // WETH
    '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO
    '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // DEGEN
  ];

  for (const tokenAddr of commonTokens) {
    try {
      const balance = await client.readContract({
        address: tokenAddr,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      }) as bigint;

      if (balance > BigInt(0)) {
        const meta = await getTokenMetadata(tokenAddr, client);
        foundTokens.set(tokenAddr, {
          address: tokenAddr,
          symbol: meta.symbol,
          name: meta.name,
          decimals: meta.decimals,
          balance: balance.toString(),
          balanceUsd: 0,
        });
      }
    } catch { continue; }
  }

  return Array.from(foundTokens.values()).map(t => ({ ...t, hasLiquidity: true }));
}

// Main scan function - tries Alchemy first, falls back to on-chain
export async function scanWalletTokens(
  walletAddress: string,
  client?: any
): Promise<Array<{
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUsd: number;
  hasLiquidity: boolean;
}>> {
  // Try Alchemy first (faster, more complete)
  if (ALCHEMY_API_KEY) {
    const alchemyTokens = await scanWalletTokensWithAlchemy(walletAddress);
    if (alchemyTokens.length > 0) return alchemyTokens;
  }

  // Fallback to on-chain check
  if (client) {
    return scanWalletTokensFallback(walletAddress, client);
  }

  return [];
}

// Get swap quote
export async function getAerodromeQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<{ amountOut: bigint; hasRoute: boolean }> {
  try {
    const result = await baseClient.readContract({
      address: DEX_ROUTERS.aerodrome as `0x${string}`,
      abi: [{
        name: 'getAmountsOut',
        type: 'function',
        inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      }],
      functionName: 'getAmountsOut',
      args: [amountIn, [tokenIn as `0x${string}`, tokenOut as `0x${string}`]],
    }) as bigint[];

    const amountOut = result[result.length - 1];
    return { amountOut, hasRoute: amountOut > BigInt(0) };
  } catch {
    return { amountOut: BigInt(0), hasRoute: false };
  }
}

export async function getBaseSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<{ amountOut: bigint; hasRoute: boolean }> {
  try {
    const result = await baseClient.readContract({
      address: DEX_ROUTERS.baseswap as `0x${string}`,
      abi: [{
        name: 'getAmountsOut',
        type: 'function',
        inputs: [{ name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      }],
      functionName: 'getAmountsOut',
      args: [amountIn, [tokenIn as `0x${string}`, tokenOut as `0x${string}`]],
    }) as bigint[];

    const amountOut = result[result.length - 1];
    return { amountOut, hasRoute: amountOut > BigInt(0) };
  } catch {
    return { amountOut: BigInt(0), hasRoute: false };
  }
}

export async function getBestQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<{ amountOut: bigint; dex: string; hasRoute: boolean }> {
  const aerodromeQuote = await getAerodromeQuote(tokenIn, tokenOut, amountIn);
  if (aerodromeQuote.hasRoute) return { ...aerodromeQuote, dex: 'Aerodrome' };

  const baseswapQuote = await getBaseSwapQuote(tokenIn, tokenOut, amountIn);
  if (baseswapQuote.hasRoute) return { ...baseswapQuote, dex: 'BaseSwap' };

  return { amountOut: BigInt(0), dex: '', hasRoute: false };
}