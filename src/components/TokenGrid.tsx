'use client';

import { useAccount, useBalance } from 'wagmi';
import { useSwapStore } from '@/lib/store';
import { scanWalletTokens } from '@/lib/dex';
import { useState, useEffect } from 'react';

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUsd: number;
  hasLiquidity: boolean;
  logoURI?: string;
}

interface TokenCardProps {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  balance: string;
  balanceUsd: number;
  hasLiquidity: boolean;
}

function TokenCard({ address, symbol, name, logoURI, balance, balanceUsd, hasLiquidity }: TokenCardProps) {
  const { selectedTokens, toggleToken } = useSwapStore();
  const isSelected = selectedTokens.has(address);

  // Generate placeholder logo based on symbol
  const getInitial = (s: string) => s.slice(0, 2).toUpperCase();
  const colorHash = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const formatBalance = (bal: string) => {
    try {
      const num = parseFloat(bal);
      if (num === 0) return '0';
      if (num < 0.0001) return '< 0.0001';
      return num.toFixed(4);
    } catch {
      return '0';
    }
  };

  return (
    <div 
      onClick={() => hasLiquidity && toggleToken(address)}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${hasLiquidity 
          ? isSelected 
            ? 'border-[#0052FF] bg-[#0052FF]/10' 
            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* Checkbox */}
      <div className={`
        absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center
        ${isSelected ? 'bg-[#0052FF] border-[#0052FF]' : 'border-gray-600'}
      `}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Token Info */}
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: colorHash(symbol) }}
        >
          {logoURI ? (
            <img src={logoURI} alt={symbol} className="w-8 h-8" />
          ) : (
            <span className="text-lg font-bold text-white">{getInitial(symbol)}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-white">{symbol}</h3>
          <p className="text-xs text-gray-400">{name}</p>
        </div>
      </div>

      {/* Balance */}
      <div className="space-y-1">
        <p className="text-lg font-medium text-white">{formatBalance(balance)}</p>
        <p className="text-sm text-gray-400">≈ ${balanceUsd.toFixed(2)}</p>
      </div>

      {!hasLiquidity && (
        <p className="text-xs text-red-400 mt-2">No liquidity pool</p>
      )}
    </div>
  );
}

export function TokenGrid() {
  const { address, isConnected } = useAccount();
  const { selectAll, deselectAll, selectedTokens } = useSwapStore();
  const [walletTokens, setWalletTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Scan for tokens using DEX liquidity pools
  useEffect(() => {
    if (!isConnected || !address) {
      setWalletTokens([]);
      return;
    }

    const scanTokens = async () => {
      setLoading(true);
      try {
        const tokens = await scanWalletTokens(address);
        setWalletTokens(tokens);
      } catch (e) {
        console.error('Token scan error:', e);
        setWalletTokens([]);
      } finally {
        setLoading(false);
      }
    };

    scanTokens();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Connect your wallet to see your tokens</p>
      </div>
    );
  }

  if (walletTokens.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">No tokens found in your wallet</p>
        <p className="text-sm text-gray-500">Make sure you have tokens with liquidity on Aerodrome or BaseSwap</p>
      </div>
    );
  }

  // Filter to tokens with balance for display
  const displayTokens = walletTokens.filter(t => t.balance && t.balance !== '0');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400">
          {displayTokens.length} tokens found • {selectedTokens.size} selected
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              walletTokens.forEach(t => {
                if (t.hasLiquidity && t.balance !== '0') {
                  selectedTokens.add(t.address);
                }
              });
            }}
            className="text-sm text-[#0052FF] hover:text-[#3377FF] transition-colors"
          >
            Select All
          </button>
          <span className="text-gray-600">•</span>
          <button
            onClick={deselectAll}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052FF]"></div>
          <p className="text-gray-400 mt-2">Scanning DEX pools for your tokens...</p>
        </div>
      )}

      {/* Token Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTokens.map(token => (
            <TokenCard
              key={token.address}
              address={token.address}
              symbol={token.symbol}
              name={token.name}
              logoURI={token.logoURI}
              balance={token.balance}
              balanceUsd={token.balanceUsd}
              hasLiquidity={token.hasLiquidity}
            />
          ))}
        </div>
      )}
    </div>
  );
}