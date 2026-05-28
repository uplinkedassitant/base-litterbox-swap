'use client';

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { base } from 'viem/chains';
import { DEX_ROUTERS, baseClient } from '@/lib/dex';
import { config } from '@/config';
import { useState, useCallback } from 'react';

interface TokenSwap {
  address: string;
  symbol: string;
  balance: bigint;
  amountOut: bigint;
  dex: string;
}

interface UseBatchSwapReturn {
  executeSwap: (tokens: TokenSwap[]) => Promise<string | null>;
  isPending: boolean;
  isConfirming: boolean;
  txHash: string | null;
  error: string | null;
}

// ERC20 ABI for approval and transfer
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'transferFrom',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  }
] as const;

// Aerodrome Router ABI for swaps
const AERODROME_ROUTER_ABI = [
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'exactInputSingle',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint256' }
        ]
      }
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable'
  }
] as const;

export function useBatchSwap() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: undefined as any, // Will be set when we have tx hash
  });
  
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if token needs approval
  const needsApproval = useCallback(async (tokenAddress: string, amount: bigint): Promise<boolean> => {
    if (!address) return false;
    
    try {
      const allowance = await baseClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, DEX_ROUTERS.aerodrome as `0x${string}`]
      }) as bigint;
      
      return allowance < amount;
    } catch {
      return false;
    }
  }, [address]);

  // Approve token for swapping
  const approveToken = useCallback(async (tokenAddress: string, amount: bigint): Promise<string> => {
    const hash = await writeContractAsync({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [DEX_ROUTERS.aerodrome as `0x${string}`, amount],
    });
    return hash;
  }, [writeContractAsync]);

  // Execute a single swap via Aerodrome
  const executeSingleSwap = useCallback(async (
    tokenIn: string,
    amountIn: bigint,
    minAmountOut: bigint
  ): Promise<string> => {
    if (!address) throw new Error('Wallet not connected');

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60); // 20 minutes
    
    const hash = await writeContractAsync({
      address: DEX_ROUTERS.aerodrome as `0x${string}`,
      abi: AERODROME_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: tokenIn as `0x${string}`,
        tokenOut: config.platformToken as `0x${string}`,
        recipient: address,
        deadline,
        amountOutMinimum: minAmountOut,
        amountIn,
        sqrtPriceLimitX96: BigInt(0)
      }],
    });
    
    return hash;
  }, [writeContractAsync, address]);

  // Execute batch swap
  const executeSwap = useCallback(async (tokens: TokenSwap[]): Promise<string | null> => {
    if (!address || tokens.length === 0) {
      setError('No tokens to swap');
      return null;
    }

    setError(null);
    setTxHash(null);

    try {
      // Process each token sequentially
      let lastHash: string | null = null;
      
      for (const token of tokens) {
        // Check if approval needed
        const approvalNeeded = await needsApproval(token.address, token.balance);
        
        if (approvalNeeded) {
          // Approve the token
          lastHash = await approveToken(token.address, token.balance);
          console.log(`Approved ${token.symbol}:`, lastHash);
          
          // Wait for approval to confirm (simple wait)
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Calculate minimum output with 0.5% slippage
        const slippage = BigInt(9950); // 0.5% = 9950/10000
        const minAmountOut = (token.amountOut * slippage) / BigInt(10000);
        
        // Execute the swap
        lastHash = await executeSingleSwap(token.address, token.balance, minAmountOut);
        console.log(`Swapped ${token.symbol}:`, lastHash);
        
        // Wait a bit between swaps to avoid nonce conflicts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (lastHash) {
        setTxHash(lastHash);
      }
      
      return lastHash;
    } catch (err: any) {
      console.error('Swap error:', err);
      setError(err.message || 'Swap failed');
      return null;
    }
  }, [address, needsApproval, approveToken, executeSingleSwap]);

  return {
    executeSwap,
    isPending,
    isConfirming,
    txHash,
    error
  };
}