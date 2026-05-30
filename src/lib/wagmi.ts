import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet } from 'wagmi/chains';
import { http } from 'wagmi';

// Public Base RPC (no API key needed for read-only)
const BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';

export const wagmiConfig = getDefaultConfig({
  chains: [base],
  transports: {
    [base.id]: http(BASE_RPC),
  },
  ssr: false,
  appName: 'Base Litterbox Swap',
  // Use a demo project ID - get your own free at https://cloud.walletconnect.com
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '4c7f57d5c5b12c5c7f5c7f57d5c5b12c',
});