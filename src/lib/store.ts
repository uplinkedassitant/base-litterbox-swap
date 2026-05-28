import { create } from 'zustand';

interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance: string;
  balanceUsd: number;
  hasLiquidity: boolean;
}

interface SwapState {
  tokens: TokenBalance[];
  selectedTokens: Set<string>;
  outputToken: string;
  quotes: Map<string, { amountOut: string; path: string[]; gasEstimate: string }>;
  isLoading: boolean;
  isSwapping: boolean;
  txHash: string | null;
  error: string | null;
  
  // Actions
  setTokens: (tokens: TokenBalance[]) => void;
  toggleToken: (address: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setOutputToken: (address: string) => void;
  setQuotes: (quotes: Map<string, { amountOut: string; path: string[]; gasEstimate: string }>) => void;
  setLoading: (loading: boolean) => void;
  setSwapping: (swapping: boolean) => void;
  setTxHash: (hash: string | null) => void;
  setError: (error: string | null) => void;
}

export const useSwapStore = create<SwapState>((set, get) => ({
  tokens: [],
  selectedTokens: new Set(),
  outputToken: '0x4200000000000000000000000000000000000006', // WETH
  quotes: new Map(),
  isLoading: false,
  isSwapping: false,
  txHash: null,
  error: null,

  setTokens: (tokens) => set({ tokens }),
  
  toggleToken: (address) => set((state) => {
    const newSelected = new Set(state.selectedTokens);
    if (newSelected.has(address)) {
      newSelected.delete(address);
    } else {
      newSelected.add(address);
    }
    return { selectedTokens: newSelected };
  }),
  
  selectAll: () => set((state) => {
    const withLiquidity = state.tokens
      .filter(t => t.hasLiquidity)
      .map(t => t.address);
    return { selectedTokens: new Set(withLiquidity) };
  }),
  
  deselectAll: () => set({ selectedTokens: new Set() }),
  
  setOutputToken: (address) => set({ outputToken: address }),
  
  setQuotes: (quotes) => set({ quotes }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setSwapping: (isSwapping) => set({ isSwapping }),
  
  setTxHash: (txHash) => set({ txHash }),
  
  setError: (error) => set({ error }),
}));