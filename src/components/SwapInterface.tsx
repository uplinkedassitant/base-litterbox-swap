'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { useSwapQuotes } from '@/lib/useSwapQuotes';
import { useBatchSwap } from '@/lib/useBatchSwap';
import { config, baseTokens } from '@/config';

export function SwapInterface() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { quotes, isLoading, totalOutput, fetchQuotes } = useSwapQuotes();
  const { executeSwap, isPending, isConfirming, txHash, error } = useBatchSwap();

  const [selectedQuotes, setSelectedQuotes] = useState<typeof quotes>([]);
  const isWrongNetwork = isConnected && chainId !== base.id;

  const outputTokenInfo = baseTokens.find(t => t.address.toLowerCase() === config.platformToken.toLowerCase());

  // Auto-select all tokens when quotes are fetched
  useEffect(() => {
    if (quotes.length > 0) {
      setSelectedQuotes(quotes);
    }
  }, [quotes]);

  const handleToggleToken = (address: string) => {
    setSelectedQuotes(prev => {
      const exists = prev.find(t => t.address === address);
      if (exists) {
        return prev.filter(t => t.address !== address);
      } else {
        const token = quotes.find(t => t.address === address);
        return token ? [...prev, token] : prev;
      }
    });
  };

  const handleFetchQuotes = async () => {
    await fetchQuotes();
  };

  const handleSwap = async () => {
    if (selectedQuotes.length === 0) return;

    const tokensToSwap = selectedQuotes.map(q => ({
      address: q.address,
      symbol: q.symbol,
      balance: BigInt(q.balance),
      amountOut: BigInt(q.amountOut),
      dex: q.dex
    }));

    await executeSwap(tokensToSwap);
  };

  const selectedTotalOutput = selectedQuotes.reduce((acc, q) => {
    return acc + parseFloat(q.amountOut) / Math.pow(10, 18);
  }, 0);

  if (isWrongNetwork) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30">
          <h2 className="text-xl font-semibold text-white mb-4">Wrong Network</h2>
          <p className="text-gray-400 mb-6">Please switch to Base to use this app</p>
          <button
            onClick={() => switchChain({ chainId: base.id })}
            className="px-6 py-3 bg-[#0052FF] hover:bg-[#3377FF] text-white font-medium rounded-xl transition-colors"
          >
            Switch to Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          🐱 Consolidate Your Tokens
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Select multiple tokens from your wallet and swap them all at once to your favorite token
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">Connect your wallet to find tokens with liquidity</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Output Token Selector */}
          <div className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Output Token</h2>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-lg">🪙</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{config.platformTokenSymbol}</p>
                <p className="text-sm text-gray-400">{config.platformTokenName}</p>
              </div>
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-600 rounded">Platform Token</span>
            </div>
          </div>

          {/* Token Scanner */}
          <div className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Tokens with Liquidity</h2>
              <button
                onClick={handleFetchQuotes}
                disabled={isLoading}
                className="px-4 py-2 bg-[#0052FF] hover:bg-[#3377FF] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Scanning...' : 'Scan Wallet'}
              </button>
            </div>

            {quotes.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Click "Scan Wallet" to check your tokens for swap routes</p>
                <p className="text-sm text-gray-500">Only tokens with valid liquidity routes will be shown</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((token) => {
                  const isSelected = selectedQuotes.some(s => s.address === token.address);
                  return (
                    <div
                      key={token.address}
                      onClick={() => handleToggleToken(token.address)}
                      className={`
                        flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-[#0052FF]/20 border-2 border-[#0052FF]' 
                          : 'bg-gray-700/50 border-2 border-transparent hover:border-gray-600'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div className={`
                          w-6 h-6 rounded-md border-2 flex items-center justify-center
                          ${isSelected ? 'bg-[#0052FF] border-[#0052FF]' : 'border-gray-500'}
                        `}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                          {token.logoURI ? (
                            <img src={token.logoURI} alt={token.symbol} className="w-8 h-8" />
                          ) : (
                            <span className="text-lg font-bold">{token.symbol.slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{token.symbol}</p>
                          <p className="text-xs text-gray-400">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(4)}
                        </p>
                        <p className="text-xs text-green-400">via {token.dex}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Summary & Swap Button */}
          {selectedQuotes.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {selectedQuotes.length} token{selectedQuotes.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xl font-semibold text-white">
                    → {selectedTotalOutput.toFixed(6)} {outputTokenInfo?.symbol}
                  </p>
                </div>
                <button
                  onClick={handleSwap}
                  disabled={isPending || isConfirming || selectedQuotes.length === 0}
                  className={`
                    px-8 py-3 rounded-xl font-semibold transition-all
                    ${isPending || isConfirming || selectedQuotes.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] hover:opacity-90 text-white'
                    }
                  `}
                >
                  {isPending ? 'Check Wallet...' : isConfirming ? 'Confirming...' : 'Swap Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Status */}
      {(txHash || isPending || isConfirming) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-gray-800 rounded-2xl p-6 text-center">
            {isPending && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-3xl">⏳</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Confirm in Wallet</h3>
                <p className="text-gray-400">Please confirm the transaction in your wallet</p>
              </>
            )}
            {isConfirming && !txHash && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Processing</h3>
                <p className="text-gray-400">Waiting for transaction confirmation...</p>
              </>
            )}
            {txHash && !isConfirming && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Swap Complete!</h3>
                <p className="text-gray-400 mb-4">Your tokens have been swapped</p>
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0052FF] hover:underline block"
                >
                  View on BaseScan →
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}