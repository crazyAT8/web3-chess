'use client';

import { useWallet } from '@/hooks/useWallet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Wifi, WifiOff, Coins } from 'lucide-react';

export function WalletStatus() {
  const { isConnected, isWrongNetwork, chainId, balance, shortAddress } = useWallet();

  if (!isConnected) {
    return (
      <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Wallet not connected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isWrongNetwork ? (
                <WifiOff className="h-4 w-4 text-red-400" />
              ) : (
                <Wifi className="h-4 w-4 text-green-400" />
              )}
              <span className="text-sm text-gray-300">Status</span>
            </div>
            <Badge 
              variant={isWrongNetwork ? "destructive" : "default"}
              className={isWrongNetwork ? "bg-red-600" : "bg-green-600"}
            >
              {isWrongNetwork ? "Wrong Network" : "Connected"}
            </Badge>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Network</span>
            <span className="text-sm text-white">{chainId || "Unknown"}</span>
          </div>

          {/* Address */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Address</span>
            <span className="text-sm text-white font-mono">{shortAddress}</span>
          </div>

          {/* Balance */}
          {balance && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-yellow-400" />
                <span className="text-sm text-gray-300">Balance</span>
              </div>
              <span className="text-sm text-white">
                {(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} {balance.symbol}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 