"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Crown, Sparkles, Coins, Zap, Star, Gem, Palette, Shuffle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const nftCollections = [
  {
    name: "Legendary Pieces",
    description: "Ultra-rare chess pieces with unique abilities",
    items: [
      { name: "Golden King", price: "500 CHESS", rarity: "Legendary", supply: "10/100", image: "golden+king+chess" },
      {
        name: "Crystal Queen",
        price: "400 CHESS",
        rarity: "Legendary",
        supply: "25/100",
        image: "crystal+queen+chess",
      },
      { name: "Diamond Rook", price: "300 CHESS", rarity: "Legendary", supply: "15/100", image: "diamond+rook+chess" },
    ],
  },
  {
    name: "Epic Avatars",
    description: "Powerful avatar NFTs with special traits",
    items: [
      { name: "Dragon Master", price: "200 CHESS", rarity: "Epic", supply: "50/500", image: "dragon+master+avatar" },
      { name: "Phoenix Knight", price: "180 CHESS", rarity: "Epic", supply: "75/500", image: "phoenix+knight+avatar" },
      { name: "Shadow Wizard", price: "160 CHESS", rarity: "Epic", supply: "100/500", image: "shadow+wizard+avatar" },
    ],
  },
  {
    name: "Mystical Boards",
    description: "Enchanted chess boards with unique environments",
    items: [
      { name: "Celestial Realm", price: "250 CHESS", rarity: "Epic", supply: "30/200", image: "celestial+chess+board" },
      {
        name: "Underwater Palace",
        price: "220 CHESS",
        rarity: "Epic",
        supply: "45/200",
        image: "underwater+chess+board",
      },
      { name: "Volcanic Arena", price: "200 CHESS", rarity: "Epic", supply: "60/200", image: "volcanic+chess+board" },
    ],
  },
]

export default function Mint() {
  const [selectedTab, setSelectedTab] = useState("pieces")
  const [mintingStatus, setMintingStatus] = useState<{ [key: string]: "idle" | "minting" | "success" | "error" }>({})

  const handleMint = async (itemName: string) => {
    setMintingStatus((prev) => ({ ...prev, [itemName]: "minting" }))

    // Simulate minting process
    setTimeout(() => {
      setMintingStatus((prev) => ({ ...prev, [itemName]: "success" }))
      setTimeout(() => {
        setMintingStatus((prev) => ({ ...prev, [itemName]: "idle" }))
      }, 3000)
    }, 2000)
  }

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
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
              Profile
            </Link>
          </nav>
          <Button className="bg-purple-600 hover:bg-purple-700">Connect Wallet</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">NFT Marketplace</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Mint unique chess pieces, avatars, and boards as NFTs. Own your digital assets and trade them on the
            blockchain.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Gem className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">5,247</div>
              <div className="text-gray-300 text-sm">Total NFTs</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1,892</div>
              <div className="text-gray-300 text-sm">Owners</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Coins className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">125.5K</div>
              <div className="text-gray-300 text-sm">Volume (CHESS)</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-gray-300 text-sm">Minted Today</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-purple-800/30 max-w-2xl mx-auto">
            <TabsTrigger value="pieces" className="data-[state=active]:bg-purple-600">
              Pieces
            </TabsTrigger>
            <TabsTrigger value="avatars" className="data-[state=active]:bg-purple-600">
              Avatars
            </TabsTrigger>
            <TabsTrigger value="boards" className="data-[state=active]:bg-purple-600">
              Boards
            </TabsTrigger>
            <TabsTrigger value="mystery" className="data-[state=active]:bg-purple-600">
              Mystery Box
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pieces" className="space-y-6">
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Crown className="mr-2 h-5 w-5" />
                  Legendary Chess Pieces
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Ultra-rare chess pieces with unique abilities and stunning visual effects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {nftCollections[0].items.map((item, index) => (
                    <Card key={index} className="bg-black/20 border-purple-700/30 overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-8 flex items-center justify-center">
                        <Image
                          src={`/placeholder.svg?height=200&width=200&query=${item.image}`}
                          alt={item.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-bold">{item.name}</h3>
                          <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30">{item.rarity}</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-400 text-sm">Supply: {item.supply}</span>
                          <span className="text-yellow-400 font-bold">{item.price}</span>
                        </div>
                        <Progress
                          value={
                            (Number.parseInt(item.supply.split("/")[0]) / Number.parseInt(item.supply.split("/")[1])) *
                            100
                          }
                          className="mb-3"
                        />
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleMint(item.name)}
                          disabled={mintingStatus[item.name] === "minting"}
                        >
                          {mintingStatus[item.name] === "minting" ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                              Minting...
                            </>
                          ) : mintingStatus[item.name] === "success" ? (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Minted!
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Mint NFT
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avatars" className="space-y-6">
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Epic Avatars
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Powerful avatar NFTs that represent your identity in the ChessFi metaverse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {nftCollections[1].items.map((item, index) => (
                    <Card key={index} className="bg-black/20 border-purple-700/30 overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 flex items-center justify-center">
                        <Image
                          src={`/placeholder.svg?height=200&width=200&query=${item.image}`}
                          alt={item.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-bold">{item.name}</h3>
                          <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30">{item.rarity}</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-400 text-sm">Supply: {item.supply}</span>
                          <span className="text-yellow-400 font-bold">{item.price}</span>
                        </div>
                        <Progress
                          value={
                            (Number.parseInt(item.supply.split("/")[0]) / Number.parseInt(item.supply.split("/")[1])) *
                            100
                          }
                          className="mb-3"
                        />
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleMint(item.name)}
                          disabled={mintingStatus[item.name] === "minting"}
                        >
                          {mintingStatus[item.name] === "minting" ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                              Minting...
                            </>
                          ) : mintingStatus[item.name] === "success" ? (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Minted!
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Mint NFT
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boards" className="space-y-6">
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gem className="mr-2 h-5 w-5" />
                  Mystical Chess Boards
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Enchanted chess boards that transform your gaming environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {nftCollections[2].items.map((item, index) => (
                    <Card key={index} className="bg-black/20 border-purple-700/30 overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-green-600/20 to-blue-600/20 p-8 flex items-center justify-center">
                        <Image
                          src={`/placeholder.svg?height=200&width=200&query=${item.image}`}
                          alt={item.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-bold">{item.name}</h3>
                          <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30">{item.rarity}</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-400 text-sm">Supply: {item.supply}</span>
                          <span className="text-yellow-400 font-bold">{item.price}</span>
                        </div>
                        <Progress
                          value={
                            (Number.parseInt(item.supply.split("/")[0]) / Number.parseInt(item.supply.split("/")[1])) *
                            100
                          }
                          className="mb-3"
                        />
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleMint(item.name)}
                          disabled={mintingStatus[item.name] === "minting"}
                        >
                          {mintingStatus[item.name] === "minting" ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                              Minting...
                            </>
                          ) : mintingStatus[item.name] === "success" ? (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Minted!
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Mint NFT
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mystery" className="space-y-6">
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shuffle className="mr-2 h-5 w-5" />
                  Mystery Boxes
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Take a chance and discover rare NFTs with mystery box minting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/50">
                    <CardContent className="p-8 text-center">
                      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Standard Mystery Box</h3>
                      <p className="text-gray-300 mb-4">Contains random NFTs from all collections</p>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Common:</span>
                          <span className="text-white">60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Rare:</span>
                          <span className="text-blue-400">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Epic:</span>
                          <span className="text-purple-400">12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Legendary:</span>
                          <span className="text-yellow-400">3%</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-yellow-400 mb-4">100 CHESS</div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Shuffle className="mr-2 h-4 w-4" />
                        Open Mystery Box
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/50">
                    <CardContent className="p-8 text-center">
                      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Crown className="h-16 w-16 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Premium Mystery Box</h3>
                      <p className="text-gray-300 mb-4">Higher chance for rare and legendary NFTs</p>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Common:</span>
                          <span className="text-white">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Rare:</span>
                          <span className="text-blue-400">35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Epic:</span>
                          <span className="text-purple-400">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Legendary:</span>
                          <span className="text-yellow-400">10%</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-yellow-400 mb-4">300 CHESS</div>
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                        <Crown className="mr-2 h-4 w-4" />
                        Open Premium Box
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
