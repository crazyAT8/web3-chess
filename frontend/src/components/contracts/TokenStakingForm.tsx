'use client';

import React, { useState } from 'react';
import { useChessTokenStake, useChessTokenUnstake, useChessTokenClaimRewards } from '@/hooks/useContractWrite';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';
import { useChessTokenBalance, useChessTokenStakingInfo } from '@/hooks/useContractRead';
import { useTransactionState } from '@/hooks/useContractWrite';
import { contractUtils } from '@/lib/contractUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Coins, TrendingUp, Award, Lock, Unlock } from 'lucide-react';

export function TokenStakingForm() {
  const [activeTab, setActiveTab] = useState('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  
  // Hooks
  const stake = useChessTokenStake();
  const unstake = useChessTokenUnstake();
  const claimRewards = useChessTokenClaimRewards();
  const transactionState = useTransactionState();
  const { writeContract } = useWriteContract();
  
  // Read data
  const { data: tokenBalance } = useChessTokenBalance();
  const { data: stakingInfo } = useChessTokenStakingInfo();
  
  // Handle stake
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      transactionState.setErrorMsg('Please enter a valid amount to stake');
      return;
    }
    
    if (tokenBalance && parseFloat(stakeAmount) > parseFloat(contractUtils.formatTokenAmount(tokenBalance as bigint))) {
      transactionState.setErrorMsg('Insufficient token balance');
      return;
    }
    
    try {
      transactionState.setLoading(true);
      transactionState.setErrorMsg(null);
      
      writeContract({
        address: CONTRACT_ADDRESSES.CHESS_TOKEN as `0x${string}`,
        abi: CONTRACT_ABIS.CHESS_TOKEN,
        functionName: 'stake',
        args: [contractUtils.parseTokenAmount(stakeAmount)]
      });
      
      transactionState.setSuccessState(true);
      setStakeAmount('');
    } catch (error) {
      transactionState.setErrorMsg(contractUtils.getErrorMessage(error));
    } finally {
      transactionState.setLoading(false);
    }
  };
  
  // Handle unstake
  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      transactionState.setErrorMsg('Please enter a valid amount to unstake');
      return;
    }
    
    if (stakingInfo && parseFloat(unstakeAmount) > parseFloat(contractUtils.formatTokenAmount((stakingInfo as any).stakedAmount))) {
      transactionState.setErrorMsg('Insufficient staked amount');
      return;
    }
    
    try {
      transactionState.setLoading(true);
      transactionState.setErrorMsg(null);
      
      writeContract({
        address: CONTRACT_ADDRESSES.CHESS_TOKEN as `0x${string}`,
        abi: CONTRACT_ABIS.CHESS_TOKEN,
        functionName: 'unstake',
        args: [contractUtils.parseTokenAmount(unstakeAmount)]
      });
      
      transactionState.setSuccessState(true);
      setUnstakeAmount('');
    } catch (error) {
      transactionState.setErrorMsg(contractUtils.getErrorMessage(error));
    } finally {
      transactionState.setLoading(false);
    }
  };
  
  // Handle claim rewards
  const handleClaimRewards = async () => {
    try {
      transactionState.setLoading(true);
      transactionState.setErrorMsg(null);
      
      writeContract({
        address: CONTRACT_ADDRESSES.CHESS_TOKEN as `0x${string}`,
        abi: CONTRACT_ABIS.CHESS_TOKEN,
        functionName: 'claimRewards'
      });
      
      transactionState.setSuccessState(true);
    } catch (error) {
      transactionState.setErrorMsg(contractUtils.getErrorMessage(error));
    } finally {
      transactionState.setLoading(false);
    }
  };
  
  const isLoading = stake.isLoading || unstake.isLoading || claimRewards.isLoading || transactionState.isLoading;
  
  // Calculate rewards
  const calculateRewards = () => {
    if (!stakingInfo) return '0';
    
    const stakedAmount = parseFloat(contractUtils.formatTokenAmount((stakingInfo as any).stakedAmount));
    const lastRewardTime = (stakingInfo as any).lastRewardTime;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - lastRewardTime;
    const daysDiff = timeDiff / (24 * 60 * 60);
    
    // 5% APY = 0.05 daily rate
    const dailyRate = 0.05 / 365;
    const rewards = stakedAmount * dailyRate * daysDiff;
    
    return rewards.toFixed(4);
  };
  
  const pendingRewards = calculateRewards();
  
  return (
    <div className="space-y-6">
      {/* Staking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-400" />
            CHESS Token Staking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Token Balance</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {tokenBalance ? contractUtils.formatTokenAmount(tokenBalance as bigint) : '0'} CHESS
              </div>
            </div>
            
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Staked Amount</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stakingInfo ? contractUtils.formatTokenAmount((stakingInfo as any).stakedAmount) : '0'} CHESS
              </div>
            </div>
            
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Pending Rewards</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {pendingRewards} CHESS
              </div>
            </div>
          </div>
          
          {/* APY Progress */}
          <div className="mt-4 p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-300">Staking APY: 5%</span>
              <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                <TrendingUp className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </div>
            <Progress value={100} className="h-2 bg-yellow-900/30" />
            <p className="text-xs text-yellow-200 mt-2">
              Earn 5% APY on your staked CHESS tokens. Rewards are calculated daily.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Staking Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-green-400" />
            Staking Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="unstake">Unstake</TabsTrigger>
              <TabsTrigger value="claim">Claim Rewards</TabsTrigger>
            </TabsList>
            
            {/* Stake Tab */}
            <TabsContent value="stake" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Amount to Stake (CHESS)</label>
                    <Input
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="100"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="bg-black/20 border-purple-800/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter the amount of CHESS tokens you want to stake
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">Staking Benefits</span>
                    </div>
                    <ul className="text-xs text-green-200 space-y-1">
                      <li>• Earn 5% APY on staked tokens</li>
                      <li>• Rewards calculated daily</li>
                      <li>• No lock-up period</li>
                      <li>• Compound interest</li>
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
                        <span className="text-gray-300">Current Balance:</span>
                        <span className="text-white">
                          {tokenBalance ? contractUtils.formatTokenAmount(tokenBalance as bigint) : '0'} CHESS
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Amount to Stake:</span>
                        <span className="text-white">{stakeAmount || '0'} CHESS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Remaining Balance:</span>
                        <span className="text-white">
                          {tokenBalance && stakeAmount 
                            ? (parseFloat(contractUtils.formatTokenAmount(tokenBalance as bigint)) - parseFloat(stakeAmount)).toFixed(2)
                            : '0'
                          } CHESS
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-blue-800/30 pt-2">
                        <span className="text-gray-300">Estimated Daily Reward:</span>
                        <span className="text-green-400 font-medium">
                          {stakeAmount ? (parseFloat(stakeAmount) * 0.05 / 365).toFixed(4) : '0'} CHESS
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleStake}
                    disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Staking...
                      </>
                    ) : (
                      'Stake Tokens'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Unstake Tab */}
            <TabsContent value="unstake" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Amount to Unstake (CHESS)</label>
                    <Input
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="50"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="bg-black/20 border-purple-800/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter the amount of staked CHESS tokens you want to withdraw
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Unlock className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-300">Unstaking Info</span>
                    </div>
                    <ul className="text-xs text-yellow-200 space-y-1">
                      <li>• No lock-up period</li>
                      <li>• Immediate withdrawal</li>
                      <li>• Claim rewards before unstaking</li>
                      <li>• Partial unstaking allowed</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Unstake Summary</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Currently Staked:</span>
                        <span className="text-white">
                          {stakingInfo ? contractUtils.formatTokenAmount((stakingInfo as any).stakedAmount) : '0'} CHESS
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Amount to Unstake:</span>
                        <span className="text-white">{unstakeAmount || '0'} CHESS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Remaining Staked:</span>
                        <span className="text-white">
                          {stakingInfo && unstakeAmount 
                            ? (parseFloat(contractUtils.formatTokenAmount((stakingInfo as any).stakedAmount)) - parseFloat(unstakeAmount)).toFixed(2)
                            : '0'
                          } CHESS
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleUnstake}
                    disabled={isLoading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Unstaking...
                      </>
                    ) : (
                      'Unstake Tokens'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Claim Rewards Tab */}
            <TabsContent value="claim" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Rewards Overview</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Pending Rewards:</span>
                        <span className="text-yellow-400 font-medium">{pendingRewards} CHESS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Staking APY:</span>
                        <span className="text-green-400">5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Last Claim:</span>
                        <span className="text-white">
                          {stakingInfo ? new Date(Number((stakingInfo as any).lastRewardTime) * 1000).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">Claiming Benefits</span>
                    </div>
                    <ul className="text-xs text-green-200 space-y-1">
                      <li>• Claim rewards anytime</li>
                      <li>• No gas fees for claiming</li>
                      <li>• Rewards added to balance</li>
                      <li>• Reset reward timer</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Claim Summary</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Available to Claim:</span>
                        <span className="text-yellow-400 font-medium">{pendingRewards} CHESS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Current Balance:</span>
                        <span className="text-white">
                          {tokenBalance ? contractUtils.formatTokenAmount(tokenBalance as bigint) : '0'} CHESS
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-blue-800/30 pt-2">
                        <span className="text-gray-300">New Balance After Claim:</span>
                        <span className="text-green-400 font-medium">
                          {tokenBalance && pendingRewards 
                            ? (parseFloat(contractUtils.formatTokenAmount(tokenBalance as bigint)) + parseFloat(pendingRewards)).toFixed(2)
                            : '0'
                          } CHESS
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleClaimRewards}
                    disabled={isLoading || parseFloat(pendingRewards) <= 0}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      'Claim Rewards'
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
              ✅ {activeTab === 'stake' ? 'Tokens staked successfully!' : 
                  activeTab === 'unstake' ? 'Tokens unstaked successfully!' : 
                  'Rewards claimed successfully!'}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Transaction Progress */}
      {(stake.isPending || stake.isConfirming || unstake.isPending || unstake.isConfirming || 
        claimRewards.isPending || claimRewards.isConfirming) && (
        <Card className="border-blue-600/30 bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {contractUtils.getTransactionStatus(
                stake.isPending || unstake.isPending || claimRewards.isPending,
                stake.isConfirming || unstake.isConfirming || claimRewards.isConfirming,
                false
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
