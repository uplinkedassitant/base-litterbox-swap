# Base Litterbox Swap

A cypherpunk-style batch swap platform for Base that lets users consolidate token dust into one token. No API keys, no KYC, just direct on-chain DEX queries.

## Features

- 🔐 **No KYC** - Everything runs on-chain via direct RPC calls
- 🐱 **Dust Consolidation** - Batch swap multiple tokens at once
- 📡 **No API Keys** - Uses Aerodrome + BaseSwap routers directly
- 🔄 **Multi-DEX** - Queries both Aerodrome and BaseSwap for best routes
- 💳 **Self-Custody** - Connect your own wallet (MetaMask, Rainbow, Coinbase, WalletConnect)

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Web3:** wagmi + viem + RainbowKit
- **DEX Integration:** Direct router contract calls (no aggregator API)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_BASE_RPC_URL` - Base mainnet RPC (default: https://mainnet.base.org)
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Optional WalletConnect ID (get free at cloud.walletconnect.com)

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Vercel

1. Import repo at https://vercel.com/new
2. Add environment variables in Vercel dashboard
3. Deploy

## How It Works

1. **Connect Wallet** - User connects their Base wallet
2. **Scan** - App queries all tokens in wallet and checks liquidity routes
3. **Select** - User selects which tokens to swap
4. **Swap** - App executes swaps sequentially via Aerodrome router
5. **Receive** - All tokens consolidated to platform token (WETH)

## Platform Token

Default output token is **WETH** (Wrapped Ether). Can be changed in `src/config/index.ts`.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Wallet   │────▶│  Next.js App     │────▶│  Base L2        │
│ (MetaMask/etc)  │     │ (wagmi + viem)   │     │ (Aerodrome)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ DEX Routers     │
                        │ - Aerodrome     │
                        │ - BaseSwap      │
                        └──────────────────┘
```

## No API Approach

This app deliberately avoids using aggregator APIs (like 1inch) that require KYC. Instead:

- **Quote Fetching:** Direct calls to DEX router `getAmountsOut()` 
- **Swap Execution:** Direct calls to router `exactInputSingle()`
- **Approvals:** Direct ERC20 `approve()` calls

This keeps it fully decentralized and cypherpunk-friendly.

## License

MIT