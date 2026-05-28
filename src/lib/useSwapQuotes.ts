'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { baseClient, getBestQuote } from '@/lib/dex';
import { baseTokens, config } from '@/config';

interface TokenQuote {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logoURI?: string;
  amountOut: string;
  hasRoute: boolean;
  dex: string;
}

interface UseSwapQuotesReturn {
  quotes: TokenQuote[];
  isLoading: boolean;
  totalOutput: string;
  selectedWithRoutes: number;
  fetchQuotes: () => Promise<void>;
}

// Check if a token has liquidity by trying to get a quote
async function checkTokenLiquidity(
  tokenAddress: string,
  amountIn: bigint,
  outputToken: string
): Promise<{ amountOut: bigint; dex: string; hasRoute: boolean }> {
  if (amountIn === BigInt(0)) {
    return { amountOut: BigInt(0), dex: '', hasRoute: false };
  }

  return getBestQuote(tokenAddress, outputToken, amountIn);
}

export function useSwapQuotes(): UseSwapQuotesReturn {
  const { address, isConnected } = useAccount();
  const [quotes, setQuotes] = useState<TokenQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuotes = useCallback(async () => {
    if (!address || !isConnected) return;

    setIsLoading(true);
    
    const outputToken = config.platformToken;
    const results: TokenQuote[] = [];

    // Check each token for liquidity
    for (const token of baseTokens) {
      try {
        // Get balance for this token
        const balance = await baseClient.readContract({
          address: token.address as `0x${string}`,
          abi: [{
            name: 'balanceOf',
            type: 'function',
            inputs: [{ name: 'owner', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }]
          }],
          functionName: 'balanceOf',
          args: [address]
        }) as bigint;

        if (balance === BigInt(0)) continue;

        // Use 1% of balance for quote check (enough to check liquidity exists)
        const quoteAmount = balance / BigInt(100);
        if (quoteAmount === BigInt(0)) continue;

        // Check liquidity on DEXes
        const quote = await checkTokenLiquidity(token.address, quoteAmount, outputToken);

        results.push({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          balance: balance.toString(),
          decimals: token.decimals,
          logoURI: token.logoURI,
          amountOut: quote.amountOut.toString(),
          hasRoute: quote.hasRoute,
          dex: quote.dex
        });
      } catch {
        // Skip tokens that error (probably not valid ERC20)
      }
    }

    // Sort by balance value (highest first), only include those with routes
    const withRoutes = results
      .filter(r => r.hasRoute)
      .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

    setQuotes(withRoutes);
    setIsLoading(false);
  }, [address, isConnected]);

  const totalOutput = quotes.reduce((acc, q) => {
    return acc + parseFloat(q.amountOut) / Math.pow(10, 18);
  }, 0);

  return {
    quotes,
    isLoading,
    totalOutput: totalOutput.toFixed(6),
    selectedWithRoutes: quotes.length,
    fetchQuotes
  };
}