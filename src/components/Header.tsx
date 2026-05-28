'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#8B5CF6] flex items-center justify-center">
              <span className="text-2xl">🐱</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Base Litterbox Swap</h1>
              <p className="text-xs text-gray-400">Batch swap on Base</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Chain indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-300">{base.name}</span>
            </div>

            {/* Connect Button */}
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </div>
    </header>
  );
}