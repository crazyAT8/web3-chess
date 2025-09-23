'use client';

import React, { useState } from 'react';
import { useChessNFTMint, useChessNFTMintChessSet } from '@/hooks/useContractWrite';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';
import { useTransactionState } from '@/hooks/useContractWrite';
import { contractUtils } from '@/lib/contractUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, Zap, Star, Sparkles, Gem } from 'lucide-react';

// NFT Type options
const NFT_TYPES = [
  { value: 0, label: 'Piece', icon: Crown, description: 'Individual chess pieces' },
  { value: 1, label: 'Board', icon: Zap, description: 'Chess boards' },
  { value: 2, label: 'Avatar', icon: Star, description: 'Player avatars' },
];

// Rarity options
const RARITY_OPTIONS = [
  { value: 0, label: 'Common', icon: Crown, color: 'text-gray-400' },
  { value: 1, label: 'Uncommon', icon: Zap, color: 'text-green-400' },
  { value: 2, label: 'Rare', icon: Star, color: 'text-blue-400' },
  { value: 3, label: 'Epic', icon: Sparkles, color: 'text-purple-400' },
  { value: 4, label: 'Legendary', icon: Gem, color: 'text-yellow-400' },
];

export function NFTMintForm() {
  const [activeTab, setActiveTab] = useState('single');
  
  // Single NFT state
  const [nftType, setNftType] = useState('0');
  const [rarity, setRarity] = useState('0');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageURI, setImageURI] = useState('');
  const [mintPrice, setMintPrice] = useState('0');
  
  // Chess Set state
  const [chessSetName, setChessSetName] = useState('');
  const [chessSetDescription, setChessSetDescription] = useState('');
  const [chessSetImageURI, setChessSetImageURI] = useState('');
  const [pieceURIs, setPieceURIs] = useState(Array(16).fill(''));
  
  // Hooks
  const singleMint = useChessNFTMint();
  const setMint = useChessNFTMintChessSet();
  const transactionState = useTransactionState();
  const { writeContract } = useWriteContract();
  
  // Handle single NFT mint
  const handleSingleMint = async () => {
    if (!name || !imageURI) {
      transactionState.setErrorMsg('Name and Image URI are required');
      return;
    }
    
    try {
      transactionState.setLoading(true);
      transactionState.setErrorMsg(null);
      
      writeContract({
        address: CONTRACT_ADDRESSES.CHESS_NFT as `0x${string}`,
        abi: CONTRACT_ABIS.CHESS_NFT,
        functionName: 'mintNFT',
        args: [
          parseInt(nftType),
          parseInt(rarity),
          name,
          description,
          imageURI,
          contractUtils.parseTokenAmount(mintPrice)
        ],
        value: contractUtils.parseETH('0.01') // Mint fee
      });
      
      transactionState.setSuccessState(true);
      // Reset form
      setName('');
      setDescription('');
      setImageURI('');
      setMintPrice('0');
    } catch (error) {
      transactionState.setErrorMsg(contractUtils.getErrorMessage(error));
    } finally {
      transactionState.setLoading(false);
    }
  };
  
  // Handle chess set mint
  const handleSetMint = async () => {
    if (!chessSetName || !chessSetImageURI || pieceURIs.some(uri => !uri)) {
      transactionState.setErrorMsg('All fields are required for chess set');
      return;
    }
    
    try {
      transactionState.setLoading(true);
      transactionState.setErrorMsg(null);
      
      writeContract({
        address: CONTRACT_ADDRESSES.CHESS_NFT as `0x${string}`,
        abi: CONTRACT_ABIS.CHESS_NFT,
        functionName: 'mintChessSet',
        args: [chessSetName, chessSetDescription, chessSetImageURI, pieceURIs],
        value: contractUtils.parseETH('0.02') // 2x mint fee for set
      });
      
      transactionState.setSuccessState(true);
      // Reset form
      setChessSetName('');
      setChessSetDescription('');
      setChessSetImageURI('');
      setPieceURIs(Array(16).fill(''));
    } catch (error) {
      transactionState.setErrorMsg(contractUtils.getErrorMessage(error));
    } finally {
      transactionState.setLoading(false);
    }
  };
  
  // Update piece URI
  const updatePieceURI = (index: number, uri: string) => {
    const newURIs = [...pieceURIs];
    newURIs[index] = uri;
    setPieceURIs(newURIs);
  };
  
  const isLoading = singleMint.isLoading || setMint.isLoading || transactionState.isLoading;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            Mint Chess NFTs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single NFT</TabsTrigger>
              <TabsTrigger value="set">Chess Set</TabsTrigger>
            </TabsList>
            
            {/* Single NFT Mint */}
            <TabsContent value="single" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">NFT Type</label>
                    <Select value={nftType} onValueChange={setNftType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NFT_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value.toString()}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-1">
                      {NFT_TYPES.find(t => t.value.toString() === nftType)?.description}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300">Rarity</label>
                    <Select value={rarity} onValueChange={setRarity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RARITY_OPTIONS.map((rarityOption) => {
                          const Icon = rarityOption.icon;
                          return (
                            <SelectItem key={rarityOption.value} value={rarityOption.value.toString()}>
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${rarityOption.color}`} />
                                <span>{rarityOption.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Golden King"
                      className="bg-black/20 border-purple-800/30"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your NFT..."
                      className="bg-black/20 border-purple-800/30"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Image URI</label>
                    <Input
                      value={imageURI}
                      onChange={(e) => setImageURI(e.target.value)}
                      placeholder="ipfs://Qm... or https://..."
                      className="bg-black/20 border-purple-800/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      IPFS hash or HTTP URL for the NFT image
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300">Mint Price (CHESS)</label>
                    <Input
                      value={mintPrice}
                      onChange={(e) => setMintPrice(e.target.value)}
                      placeholder="0.1"
                      type="number"
                      step="0.01"
                      className="bg-black/20 border-purple-800/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Price in CHESS tokens (optional)
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Mint Fee:</span>
                      <span className="text-white">0.01 ETH</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-300">Total Cost:</span>
                      <span className="text-white font-medium">0.01 ETH</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSingleMint}
                    disabled={isLoading || !name || !imageURI}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      'Mint NFT'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Chess Set Mint */}
            <TabsContent value="set" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Set Name</label>
                    <Input
                      value={chessSetName}
                      onChange={(e) => setChessSetName(e.target.value)}
                      placeholder="e.g., Royal Chess Set"
                      className="bg-black/20 border-purple-800/30"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300">Set Description</label>
                    <Input
                      value={chessSetDescription}
                      onChange={(e) => setChessSetDescription(e.target.value)}
                      placeholder="Describe your chess set..."
                      className="bg-black/20 border-purple-800/30"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300">Set Image URI</label>
                    <Input
                      value={chessSetImageURI}
                      onChange={(e) => setChessSetImageURI(e.target.value)}
                      placeholder="ipfs://Qm... or https://..."
                      className="bg-black/20 border-purple-800/30"
                    />
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Mint Fee:</span>
                      <span className="text-white">0.02 ETH</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-300">Includes:</span>
                      <span className="text-white">16 pieces + 1 set NFT</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSetMint}
                    disabled={isLoading || !chessSetName || !chessSetImageURI || pieceURIs.some(uri => !uri)}
                    className="w-full bg-purple-700 hover:bg-purple-800"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting Set...
                      </>
                    ) : (
                      'Mint Chess Set'
                    )}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Piece Image URIs (16 pieces)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {pieceURIs.map((uri, index) => (
                        <div key={index} className="space-y-1">
                          <label className="text-xs text-gray-400">Piece {index + 1}</label>
                          <Input
                            value={uri}
                            onChange={(e) => updatePieceURI(index, e.target.value)}
                            placeholder="ipfs://..."
                            className="bg-black/20 border-purple-800/30 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Provide 16 image URIs for all chess pieces
                    </p>
                  </div>
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
              ✅ NFT minted successfully! Check your wallet.
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Transaction Progress */}
      {(singleMint.isPending || singleMint.isConfirming || setMint.isPending || setMint.isConfirming) && (
        <Card className="border-blue-600/30 bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {contractUtils.getTransactionStatus(
                singleMint.isPending || setMint.isPending,
                singleMint.isConfirming || setMint.isConfirming,
                false
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
