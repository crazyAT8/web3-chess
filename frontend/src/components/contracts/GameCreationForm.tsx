'use client';

import React, { useState } from 'react';
import { useChessGameCreate, useChessGameJoin } from '@/hooks/useContractWrite';
import { useTransactionState } from '@/hooks/useContractWrite';
import { contractUtils } from '@/lib/contractUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gamepad2, Users, Coins, Target } from 'lucide-react';

export function GameCreationForm() {
  const [activeTab, setActiveTab] = useState('create');
  
  // Create game state
  const [stakeAmount, setStakeAmount] = useState('0.001');
  
  // Join game state
  const [gameId, setGameId] = useState('');
  
  // Hooks
  const createGame = useChessGameCreate();
  const joinGame = useChessGameJoin();
  const transactionState = useTransactionState();
  
  // Handle create game
  const handleCreateGame = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) < 0.001) {
      transactionState.setErrorMsg('Stake amount must be at least 0.001 ETH');
      return;
    }
    
    try {
      transactionState.setLoading(true);
      transactionState.setErrorMsg(null);
      
      await createGame.writeAsync({
        args: [contractUtils.parseETH(stakeAmount)],
        value: contractUtils.parseETH(stakeAmount)
      });
      
      transactionState.setSuccessState(true);
      setStakeAmount('0.001');
    } catch (error) {
      transactionState.setErrorMsg(contractUtils.getErrorMessage(error));
    } finally {
      transactionState.setLoading(false);
    }
  };
  
  // Handle join game
  const handleJoinGame = async () => {
    if (!gameId || !stakeAmount) {
      transactionState.setErrorMsg('Game ID and stake amount are required');
      return;
    }
    
    try {
      transactionState.setLoading(true);
      transactionState.setErrorMsg(null);
      
      await joinGame.writeAsync({
        args: [parseInt(gameId)],
        value: contractUtils.parseETH(stakeAmount)
      });
      
      transactionState.setSuccessState(true);
      setGameId('');
      setStakeAmount('0.001');
    } catch (error) {
      transactionState.setErrorMsg(contractUtils.getErrorMessage(error));
    } finally {
      transactionState.setLoading(false);
    }
  };
  
  const isLoading = createGame.isLoading || joinGame.isLoading || transactionState.isLoading;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-green-400" />
            Chess Game Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Game</TabsTrigger>
              <TabsTrigger value="join">Join Game</TabsTrigger>
            </TabsList>
            
            {/* Create Game */}
            <TabsContent value="create" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Stake Amount (ETH)</label>
                    <Input
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.001"
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="10"
                      className="bg-black/20 border-purple-800/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Amount to stake for the game (0.001 - 10 ETH)
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">Game Rules</span>
                    </div>
                    <ul className="text-xs text-green-200 space-y-1">
                      <li>• Winner takes 95% of total stake</li>
                      <li>• 5% goes to platform fees</li>
                      <li>• Game timeout: 1 hour</li>
                      <li>• Minimum stake: 0.001 ETH</li>
                      <li>• Maximum stake: 10 ETH</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Stake Summary</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Your Stake:</span>
                        <span className="text-white">{stakeAmount} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Pot:</span>
                        <span className="text-white">{stakeAmount} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Platform Fee:</span>
                        <span className="text-red-400">{(parseFloat(stakeAmount) * 0.05).toFixed(4)} ETH</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-800/30 pt-2">
                        <span className="text-gray-300">Winner Gets:</span>
                        <span className="text-green-400 font-medium">
                          {(parseFloat(stakeAmount) * 0.95).toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCreateGame}
                    disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) < 0.001}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Game...
                      </>
                    ) : (
                      'Create Game'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Join Game */}
            <TabsContent value="join" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Game ID</label>
                    <Input
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      placeholder="1"
                      type="number"
                      min="1"
                      className="bg-black/20 border-purple-800/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter the ID of the game you want to join
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300">Stake Amount (ETH)</label>
                    <Input
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.001"
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="10"
                      className="bg-black/20 border-purple-800/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Must match the original game stake
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-300">Joining Rules</span>
                    </div>
                    <ul className="text-xs text-yellow-200 space-y-1">
                      <li>• Stake amount must match exactly</li>
                      <li>• Cannot join your own game</li>
                      <li>• Game must be in waiting state</li>
                      <li>• Only one player can join per game</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Game Status</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Game ID:</span>
                        <span className="text-white">{gameId || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Your Stake:</span>
                        <span className="text-white">{stakeAmount} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Pot:</span>
                        <span className="text-white">
                          {gameId && stakeAmount ? (parseFloat(stakeAmount) * 2).toFixed(4) : '0'} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Platform Fee:</span>
                        <span className="text-red-400">
                          {gameId && stakeAmount ? (parseFloat(stakeAmount) * 2 * 0.05).toFixed(4) : '0'} ETH
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-purple-800/30 pt-2">
                        <span className="text-gray-300">Winner Gets:</span>
                        <span className="text-green-400 font-medium">
                          {gameId && stakeAmount ? (parseFloat(stakeAmount) * 2 * 0.95).toFixed(4) : '0'} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleJoinGame}
                    disabled={isLoading || !gameId || !stakeAmount || parseFloat(stakeAmount) < 0.001}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining Game...
                      </>
                    ) : (
                      'Join Game'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Transaction Status */}
      {transactionState.error && (
        <Card className="border-red-600/30 bg-red-900/10">
          <CardContent className="p-4">
            <div className="text-red-400 text-sm">
              Error: {transactionState.error}
            </div>
          </CardContent>
        </Card>
      )}
      
      {transactionState.success && (
        <Card className="border-green-600/30 bg-green-900/10">
          <CardContent className="p-4">
            <div className="text-green-400 text-sm">
              ✅ {activeTab === 'create' ? 'Game created successfully!' : 'Game joined successfully!'}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Transaction Progress */}
      {(createGame.isPending || createGame.isConfirming || joinGame.isPending || joinGame.isConfirming) && (
        <Card className="border-blue-600/30 bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {contractUtils.getTransactionStatus(
                createGame.isPending || joinGame.isPending,
                createGame.isConfirming || joinGame.isConfirming,
                false
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
