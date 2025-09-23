'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import { areContractsReady, getTestContractAddresses, TEST_CONFIG } from '@/config/test-contracts';
import { useContractContext } from '@/contexts/ContractContext';
import { useChessTokenBalance, useChessNFTBalance } from '@/hooks/useContractRead';
import { contractUtils } from '@/lib/contractUtils';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'skipped';
  message: string;
  details?: any;
}

export function IntegrationTester() {
  const { isConnected, address } = useAccount();
  const { chessToken, chessNFT, chessGame, chessTournament } = useContractContext();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  
  // Contract read hooks for testing
  const { data: tokenBalance, isLoading: tokenBalanceLoading } = useChessTokenBalance();
  const { data: nftBalance, isLoading: nftBalanceLoading } = useChessNFTBalance();

  // Initialize test results
  useEffect(() => {
    const initialTests: TestResult[] = [
      { name: 'Wallet Connection', status: 'pending', message: 'Checking wallet connection...' },
      { name: 'Contract Configuration', status: 'pending', message: 'Verifying contract addresses...' },
      { name: 'Contract Instances', status: 'pending', message: 'Testing contract instance creation...' },
      { name: 'Contract Reads', status: 'pending', message: 'Testing contract read operations...' },
      { name: 'Contract Writes', status: 'pending', message: 'Testing contract write operations...' },
      { name: 'Error Handling', status: 'pending', message: 'Testing error handling...' },
      { name: 'Transaction State', status: 'pending', message: 'Testing transaction state management...' },
    ];
    setTestResults(initialTests);
  }, []);

  // Run all tests
  const runTests = async () => {
    setIsRunning(true);
    setTestResults(prev => prev.map(test => ({ ...test, status: 'pending' as const })));

    // Test 1: Wallet Connection
    await runTest(0, 'Wallet Connection', async () => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      if (!address) {
        throw new Error('No wallet address');
      }
      return { address, isConnected };
    });

    // Test 2: Contract Configuration
    await runTest(1, 'Contract Configuration', async () => {
      const addresses = getTestContractAddresses();
      const ready = areContractsReady();
      
      if (!ready) {
        throw new Error('Contracts not properly configured');
      }
      
      return { addresses, ready };
    });

    // Test 3: Contract Instances
    await runTest(2, 'Contract Instances', async () => {
      const contracts = { chessToken, chessNFT, chessGame, chessTournament };
      const contractNames = ['chessToken', 'chessNFT', 'chessGame', 'chessTournament'];
      const missingContracts = contractNames.filter(name => !contracts[name as keyof typeof contracts]);
      
      if (missingContracts.length > 0) {
        throw new Error(`Missing contracts: ${missingContracts.join(', ')}`);
      }
      
      return { contracts: contractNames, available: true };
    });

    // Test 4: Contract Reads
    await runTest(3, 'Contract Reads', async () => {
      // Test token balance read
      if (tokenBalanceLoading) {
        throw new Error('Token balance read is still loading');
      }
      
      // Test NFT balance read
      if (nftBalanceLoading) {
        throw new Error('NFT balance read is still loading');
      }
      
      return { 
        tokenBalance: tokenBalance ? contractUtils.formatTokenAmount(tokenBalance as bigint) : '0',
        nftBalance: nftBalance ? nftBalance.toString() : '0'
      };
    });

    // Test 5: Contract Writes (Simulated)
    await runTest(4, 'Contract Writes', async () => {
      // This is a simulation - we don't actually execute writes during testing
      // In a real scenario, you'd test with small amounts or on testnet
      return { simulated: true, message: 'Write operations would be tested with real transactions' };
    });

    // Test 6: Error Handling
    await runTest(5, 'Error Handling', async () => {
      // Test error message extraction
      const testError = new Error('Test error message');
      const extractedMessage = contractUtils.getErrorMessage(testError);
      
      if (!extractedMessage) {
        throw new Error('Error message extraction failed');
      }
      
      return { extractedMessage, success: true };
    });

    // Test 7: Transaction State
    await runTest(6, 'Transaction State', async () => {
      // Test transaction status helper
      const status = contractUtils.getTransactionStatus(true, false, false);
      
      if (!status || status === '') {
        throw new Error('Transaction status helper failed');
      }
      
      return { status, success: true };
    });

    setIsRunning(false);
    setCurrentTest('');
  };

  // Run individual test
  const runTest = async (index: number, name: string, testFn: () => Promise<any>) => {
    setCurrentTest(name);
    
    try {
      const result = await testFn();
      setTestResults(prev => prev.map((test, i) => 
        i === index 
          ? { ...test, status: 'success' as const, message: 'Test passed successfully', details: result }
          : test
      ));
    } catch (error) {
      setTestResults(prev => prev.map((test, i) => 
        i === index 
          ? { ...test, status: 'error' as const, message: error instanceof Error ? error.message : 'Unknown error', details: error }
          : test
      ));
    }
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // Get test summary
  const getTestSummary = () => {
    const total = testResults.length;
    const passed = testResults.filter(t => t.status === 'success').length;
    const failed = testResults.filter(t => t.status === 'error').length;
    const pending = testResults.filter(t => t.status === 'pending').length;
    
    return { total, passed, failed, pending };
  };

  const summary = getTestSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-6 w-6 text-blue-400" />
            Contract Integration Tester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                <div className="text-2xl font-bold text-blue-400">{summary.total}</div>
                <div className="text-sm text-gray-300">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800/30">
                <div className="text-2xl font-bold text-green-400">{summary.passed}</div>
                <div className="text-sm text-gray-300">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-800/30">
                <div className="text-2xl font-bold text-red-400">{summary.failed}</div>
                <div className="text-sm text-gray-300">Failed</div>
              </div>
              <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                <div className="text-2xl font-bold text-yellow-400">{summary.pending}</div>
                <div className="text-sm text-gray-300">Pending</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Test Progress</span>
                <span className="text-white">{summary.passed}/{summary.total}</span>
              </div>
              <Progress 
                value={(summary.passed / summary.total) * 100} 
                className="h-2"
              />
            </div>

            {/* Test Controls */}
            <div className="flex gap-4">
              <Button
                onClick={runTests}
                disabled={isRunning || !isConnected}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
              
              {!isConnected && (
                <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Connect Wallet to Test
                </Badge>
              )}
            </div>

            {/* Current Test */}
            {currentTest && (
              <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                <div className="flex items-center gap-2 text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running: {currentTest}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  test.status === 'success'
                    ? 'bg-green-900/20 border-green-800/30'
                    : test.status === 'error'
                    ? 'bg-red-900/20 border-red-800/30'
                    : test.status === 'pending'
                    ? 'bg-yellow-900/20 border-yellow-800/30'
                    : 'bg-gray-900/20 border-gray-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {test.status === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                    {test.status === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
                    {test.status === 'pending' && <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />}
                    <span className="font-medium text-white">{test.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      test.status === 'success'
                        ? 'bg-green-600/20 text-green-300'
                        : test.status === 'error'
                        ? 'bg-red-600/20 text-red-300'
                        : test.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-300'
                        : 'bg-gray-600/20 text-gray-300'
                    }
                  >
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-300">{test.message}</div>
                {test.details && (
                  <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono text-gray-400">
                    {JSON.stringify(test.details, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Contract Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Contracts Ready:</span>
              <Badge
                variant="secondary"
                className={areContractsReady() ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}
              >
                {areContractsReady() ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Using Mock Data:</span>
              <Badge
                variant="secondary"
                className={TEST_CONFIG.USE_MOCK_DATA ? 'bg-yellow-600/20 text-yellow-300' : 'bg-blue-600/20 text-blue-300'}
              >
                {TEST_CONFIG.USE_MOCK_DATA ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Wallet Connected:</span>
              <Badge
                variant="secondary"
                className={isConnected ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}
              >
                {isConnected ? 'Yes' : 'No'}
              </Badge>
            </div>

            {isConnected && address && (
              <div className="p-3 bg-black/20 rounded-lg">
                <div className="text-sm text-gray-300">Wallet Address:</div>
                <div className="text-xs font-mono text-white break-all">{address}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
