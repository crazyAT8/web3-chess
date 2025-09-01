'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useChessToken, useChessNFT, useChessGame, useChessTournament } from '@/lib/contracts';
import { useChessTokenBalance, useChessNFTBalance, useChessGamePlayerStats } from '@/hooks/useContractRead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Wallet, Coins, Crown, Gamepad2 } from 'lucide-react';

export function ContractTester() {
  const { address, isConnected } = useAccount();
  const [testResults, setTestResults] = useState<Record<string, { status: 'pending' | 'success' | 'error'; message: string }>>({});
  const [isTesting, setIsTesting] = useState(false);

  // Contract instances
  const chessToken = useChessToken();
  const chessNFT = useChessNFT();
  const chessGame = useChessGame();
  const chessTournament = useChessTournament();

  // Contract data
  const { data: tokenBalance, isLoading: tokenLoading, error: tokenError } = useChessTokenBalance();
  const { data: nftBalance, isLoading: nftLoading, error: nftError } = useChessNFTBalance();
  const { data: playerStats, isLoading: statsLoading, error: statsError } = useChessGamePlayerStats();

  const runContractTests = async () => {
    if (!isConnected) {
      setTestResults({
        wallet: { status: 'error', message: 'Wallet not connected' }
      });
      return;
    }

    setIsTesting(true);
    const results: Record<string, { status: 'pending' | 'success' | 'error'; message: string }> = {};

    try {
      // Test 1: Wallet Connection
      results.wallet = { status: 'success', message: `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` };

      // Test 2: ChessToken Contract
      try {
        const tokenName = await chessToken.read.name();
        const tokenSymbol = await chessToken.read.symbol();
        results.chessToken = { 
          status: 'success', 
          message: `Connected: ${tokenName} (${tokenSymbol})` 
        };
      } catch (error) {
        results.chessToken = { 
          status: 'error', 
          message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Test 3: ChessNFT Contract
      try {
        const nftName = await chessNFT.read.name();
        const nftSymbol = await chessNFT.read.symbol();
        results.chessNFT = { 
          status: 'success', 
          message: `Connected: ${nftName} (${nftSymbol})` 
        };
      } catch (error) {
        results.chessNFT = { 
          status: 'error', 
          message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Test 4: ChessGame Contract
      try {
        const minStake = await chessGame.read.minStake();
        const maxStake = await chessGame.read.maxStake();
        results.chessGame = { 
          status: 'success', 
          message: `Connected: Min stake ${minStake} ETH, Max stake ${maxStake} ETH` 
        };
      } catch (error) {
        results.chessGame = { 
          status: 'error', 
          message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Test 5: ChessTournament Contract
      try {
        const tournamentCount = await chessTournament.read.tournamentCount();
        results.chessTournament = { 
          status: 'success', 
          message: `Connected: ${tournamentCount} tournaments` 
        };
      } catch (error) {
        results.chessTournament = { 
          status: 'error', 
          message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Test 6: Contract Data Reading
      if (tokenBalance !== undefined) {
        results.tokenBalance = { 
          status: 'success', 
          message: `Balance: ${tokenBalance?.toString() || '0'} tokens` 
        };
      } else if (tokenError) {
        results.tokenBalance = { 
          status: 'error', 
          message: `Failed: ${tokenError.message}` 
        };
      } else {
        results.tokenBalance = { 
          status: 'pending', 
          message: 'Loading...' 
        };
      }

      if (nftBalance !== undefined) {
        results.nftBalance = { 
          status: 'success', 
          message: `Balance: ${nftBalance?.toString() || '0'} NFTs` 
        };
      } else if (nftError) {
        results.nftBalance = { 
          status: 'error', 
          message: `Failed: ${nftError.message}` 
        };
      } else {
        results.nftBalance = { 
          status: 'pending', 
          message: 'Loading...' 
        };
      }

    } catch (error) {
      console.error('Contract testing error:', error);
    }

    setTestResults(results);
    setIsTesting(false);
  };

  useEffect(() => {
    if (isConnected) {
      runContractTests();
    }
  }, [isConnected]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-blue-400" />
          Contract Integration Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Connect your wallet to test contracts</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Testing contract connectivity and basic functionality...
              </p>
              <Button 
                onClick={runContractTests} 
                disabled={isTesting}
                size="sm"
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Re-run Tests'
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium capitalize">
                        {testName.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Test Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Tests:</span> {Object.keys(testResults).length}
                  </div>
                  <div>
                    <span className="font-medium">Passed:</span> {Object.values(testResults).filter(r => r.status === 'success').length}
                  </div>
                  <div>
                    <span className="font-medium">Failed:</span> {Object.values(testResults).filter(r => r.status === 'error').length}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
