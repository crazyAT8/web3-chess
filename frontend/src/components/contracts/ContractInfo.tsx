'use client';

import React from 'react';
import { useContractContext } from '@/contexts/ContractContext';
import { areContractsConfigured, getNetworkInfo } from '@/config/contracts';
import { contractUtils } from '@/lib/contractUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ContractInfo() {
  const { tokenBalance, nftBalance, playerStats, isLoading, error } = useContractContext();
  const networkInfo = getNetworkInfo();
  const contractsConfigured = areContractsConfigured();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading contract information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Contract Status
            <Badge variant={contractsConfigured ? "default" : "destructive"}>
              {contractsConfigured ? "Configured" : "Not Configured"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="font-mono">{networkInfo.NAME} (ID: {networkInfo.CHAIN_ID})</span>
            </div>
            <div className="flex justify-between">
              <span>RPC URL:</span>
              <span className="font-mono text-sm">{networkInfo.RPC_URL}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {contractsConfigured && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tokenBalance ? contractUtils.formatTokenAmount(tokenBalance) : '0'} CHESS
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NFT Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nftBalance ? nftBalance.toString() : '0'} NFTs
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Player Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {playerStats ? playerStats.toString() : '0'} wins
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {!contractsConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-yellow-600">
              <p>Contracts are not yet configured. You need to:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Deploy the smart contracts</li>
                <li>Set the contract addresses in environment variables</li>
                <li>Restart the application</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
