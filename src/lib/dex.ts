import { http, createPublicClient } from 'viem';
import { base } from 'viem/chains';

// DEX Router Addresses on Base
export const DEX_ROUTERS = {
  // Aerodrome - Base's main DEX (Velodrome fork)
  aerodrome: '0x6Cb442acF35158D5eDa88fe602221b67B400Be3E',
  // BaseSwap - Another popular DEX on Base
  baseswap: '0x327Df1E6D0586d73D5E2C94E5B49dA11EDd3F3b6',
} as const;

// Create Base public client for reading from blockchain
export const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

// Get swap quote from Aerodrome router
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
        inputs: [
          { name: 'amountIn', type: 'uint256' },
          { name: 'path', type: 'address[]' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      }],
      functionName: 'getAmountsOut',
      args: [amountIn, [tokenIn as `0x${string}`, tokenOut as `0x${string}`]],
    }) as bigint[];

    const amountOut = result[result.length - 1];
    return {
      amountOut,
      hasRoute: amountOut > BigInt(0)
    };
  } catch {
    return { amountOut: BigInt(0), hasRoute: false };
  }
}

// Get quote from BaseSwap
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
        inputs: [
          { name: 'amountIn', type: 'uint256' },
          { name: 'path', type: 'address[]' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      }],
      functionName: 'getAmountsOut',
      args: [amountIn, [tokenIn as `0x${string}`, tokenOut as `0x${string}`]],
    }) as bigint[];

    const amountOut = result[result.length - 1];
    return {
      amountOut,
      hasRoute: amountOut > BigInt(0)
    };
  } catch {
    return { amountOut: BigInt(0), hasRoute: false };
  }
}

// Try multiple DEXes and return best quote
export async function getBestQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<{ amountOut: bigint; dex: string; hasRoute: boolean }> {
  // Try Aerodrome first (usually best liquidity on Base)
  const aerodromeQuote = await getAerodromeQuote(tokenIn, tokenOut, amountIn);
  if (aerodromeQuote.hasRoute) {
    return { ...aerodromeQuote, dex: 'Aerodrome' };
  }

  // Try BaseSwap if Aerodrome fails
  const baseswapQuote = await getBaseSwapQuote(tokenIn, tokenOut, amountIn);
  if (baseswapQuote.hasRoute) {
    return { ...baseswapQuote, dex: 'BaseSwap' };
  }

  return { amountOut: BigInt(0), dex: '', hasRoute: false };
}