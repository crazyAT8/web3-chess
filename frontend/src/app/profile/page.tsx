"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Crown, Wallet, Trophy, Coins, TrendingUp, Calendar, Award } from "lucide-react"
import Link from "next/link"
import { CustomConnectButton } from "@/components/wallet/ConnectButton"
import { WalletStatus } from "@/components/wallet/WalletStatus"
import { useWallet } from "@/hooks/useWallet"

export default function Profile() {
  const { isConnected, address, balance, chain } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">ChessFi</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/game" className="text-gray-300 hover:text-white transition-colors">
              Play
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
              Leaderboard
            </Link>
            <Link href="/mint" className="text-gray-300 hover:text-white transition-colors">
              Mint NFTs
            </Link>
          </nav>
          <CustomConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="max-w-md mx-auto text-center py-20">
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <Wallet className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">Connect Your Wallet</CardTitle>
                <CardDescription className="text-gray-300">
                  Connect your Web3 wallet to access your profile, NFTs, and game history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomConnectButton />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar & Basic Info */}
              <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-purple-500">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback>GM</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-white mb-2">GrandMaster_42</h2>
                  <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30 mb-4">
                    <Crown className="mr-1 h-3 w-3" />
                    Grandmaster
                  </Badge>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Rating: 2150</div>
                    <div>Rank: #47 Global</div>
                    <div>Member since: Jan 2024</div>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Info */}
              <WalletStatus />

              {/* Quick Stats */}
              <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Games Played:</span>
                    <span className="text-white">342</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Win Rate:</span>
                    <span className="text-green-400">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tournaments:</span>
                    <span className="text-purple-400">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">NFTs Owned:</span>
                    <span className="text-yellow-400">23</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-purple-800/30">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="nfts" className="data-[state=active]:bg-purple-600">
                    NFTs
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">
                    Achievements
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Performance Chart */}
                  <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Rating Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Current Rating</span>
                          <span className="text-white">2150</span>
                        </div>
                        <Progress value={75} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>1800</span>
                          <span>Next: Master (2200)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Games */}
                  <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Games</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { opponent: "ChessNinja", result: "Win", rating: "+15", time: "2h ago" },
                          { opponent: "KnightRider", result: "Loss", rating: "-12", time: "5h ago" },
                          { opponent: "QueenSlayer", result: "Win", rating: "+18", time: "1d ago" },
                          { opponent: "PawnStorm", result: "Win", rating: "+14", time: "2d ago" },
                        ].map((game, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{game.opponent[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-white font-medium">{game.opponent}</div>
                                <div className="text-gray-400 text-sm">{game.time}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                className={
                                  game.result === "Win"
                                    ? "bg-green-600/20 text-green-300 border-green-600/30"
                                    : "bg-red-600/20 text-red-300 border-red-600/30"
                                }
                              >
                                {game.result}
                              </Badge>
                              <div className={`text-sm ${game.result === "Win" ? "text-green-400" : "text-red-400"}`}>
                                {game.rating}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="nfts" className="space-y-6">
                  <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">My NFT Collection</CardTitle>
                      <CardDescription className="text-gray-300">
                        Your owned chess pieces, boards, and avatar NFTs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { name: "Golden King", type: "Piece", rarity: "Legendary" },
                          { name: "Crystal Queen", type: "Piece", rarity: "Epic" },
                          { name: "Mystic Board", type: "Board", rarity: "Rare" },
                          { name: "Dragon Knight", type: "Avatar", rarity: "Epic" },
                          { name: "Silver Rook", type: "Piece", rarity: "Common" },
                          { name: "Enchanted Pawn", type: "Piece", rarity: "Rare" },
                        ].map((nft, index) => (
                          <Card key={index} className="bg-black/20 border-purple-700/30">
                            <CardContent className="p-4">
                              <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg mb-3 flex items-center justify-center">
                                <Crown className="h-8 w-8 text-yellow-400" />
                              </div>
                              <h3 className="text-white font-medium mb-1">{nft.name}</h3>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">{nft.type}</span>
                                <Badge
                                  className={
                                    nft.rarity === "Legendary"
                                      ? "bg-yellow-600/20 text-yellow-300 border-yellow-600/30"
                                      : nft.rarity === "Epic"
                                        ? "bg-purple-600/20 text-purple-300 border-purple-600/30"
                                        : nft.rarity === "Rare"
                                          ? "bg-blue-600/20 text-blue-300 border-blue-600/30"
                                          : "bg-gray-600/20 text-gray-300 border-gray-600/30"
                                  }
                                >
                                  {nft.rarity}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Game History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-400 text-sm">
                                {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                              </div>
                              <div className="text-white">vs RandomPlayer{i + 1}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={
                                  Math.random() > 0.5 ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"
                                }
                              >
                                {Math.random() > 0.5 ? "Win" : "Loss"}
                              </Badge>
                              <span className="text-gray-400 text-sm">10:32</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Award className="mr-2 h-5 w-5" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { name: "First Victory", description: "Win your first game", unlocked: true },
                          { name: "Winning Streak", description: "Win 5 games in a row", unlocked: true },
                          { name: "Tournament Champion", description: "Win a tournament", unlocked: true },
                          { name: "NFT Collector", description: "Own 10 NFTs", unlocked: true },
                          { name: "Rating Climber", description: "Reach 2000 rating", unlocked: true },
                          { name: "Chess Master", description: "Reach 2200 rating", unlocked: false },
                        ].map((achievement, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${achievement.unlocked ? "bg-purple-600/10 border-purple-600/30" : "bg-gray-600/10 border-gray-600/30"}`}
                          >
                            <div className="flex items-center space-x-3">
                              <Trophy
                                className={`h-8 w-8 ${achievement.unlocked ? "text-yellow-400" : "text-gray-500"}`}
                              />
                              <div>
                                <h3 className={`font-medium ${achievement.unlocked ? "text-white" : "text-gray-400"}`}>
                                  {achievement.name}
                                </h3>
                                <p className="text-gray-400 text-sm">{achievement.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
