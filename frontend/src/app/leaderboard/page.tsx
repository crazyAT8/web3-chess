import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Crown, Trophy, TrendingUp, Calendar, Star, Medal } from "lucide-react"
import Link from "next/link"

const topPlayers = [
  {
    rank: 1,
    name: "ChessMaster3000",
    rating: 2450,
    games: 1250,
    winRate: 78,
    avatar: "chess+grandmaster",
    country: "🇺🇸",
    change: "+25",
  },
  {
    rank: 2,
    name: "QueenGambit",
    rating: 2398,
    games: 980,
    winRate: 75,
    avatar: "chess+queen",
    country: "🇷🇺",
    change: "+18",
  },
  {
    rank: 3,
    name: "KnightRider99",
    rating: 2367,
    games: 1100,
    winRate: 73,
    avatar: "chess+knight",
    country: "🇩🇪",
    change: "+12",
  },
  {
    rank: 4,
    name: "RookStorm",
    rating: 2334,
    games: 890,
    winRate: 71,
    avatar: "chess+rook",
    country: "🇫🇷",
    change: "+8",
  },
  {
    rank: 5,
    name: "BishopBlitz",
    rating: 2298,
    games: 750,
    winRate: 69,
    avatar: "chess+bishop",
    country: "🇬🇧",
    change: "+15",
  },
  {
    rank: 6,
    name: "PawnPromotion",
    rating: 2267,
    games: 1050,
    winRate: 68,
    avatar: "chess+pawn",
    country: "🇮🇳",
    change: "-5",
  },
  {
    rank: 7,
    name: "CheckmateKing",
    rating: 2245,
    games: 920,
    winRate: 67,
    avatar: "chess+king",
    country: "🇧🇷",
    change: "+22",
  },
  {
    rank: 8,
    name: "CastleDefender",
    rating: 2223,
    games: 680,
    winRate: 66,
    avatar: "chess+castle",
    country: "🇯🇵",
    change: "+10",
  },
  {
    rank: 9,
    name: "EndgameExpert",
    rating: 2201,
    games: 1200,
    winRate: 65,
    avatar: "chess+expert",
    country: "🇨🇦",
    change: "+7",
  },
  {
    rank: 10,
    name: "TacticalTitan",
    rating: 2189,
    games: 850,
    winRate: 64,
    avatar: "chess+titan",
    country: "🇦🇺",
    change: "+3",
  },
]

const tournaments = [
  { name: "Weekly Blitz Championship", prize: "500 CHESS", participants: 128, status: "Live", timeLeft: "2h 15m" },
  { name: "Monthly Grand Prix", prize: "2000 CHESS", participants: 256, status: "Registration", timeLeft: "3d 8h" },
  { name: "NFT Masters Cup", prize: "Legendary NFT", participants: 64, status: "Upcoming", timeLeft: "1w 2d" },
  { name: "Rapid Fire Friday", prize: "300 CHESS", participants: 96, status: "Completed", winner: "ChessMaster3000" },
]

export default function Leaderboard() {
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
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
              Profile
            </Link>
            <Link href="/mint" className="text-gray-300 hover:text-white transition-colors">
              Mint NFTs
            </Link>
          </nav>
          <Button className="bg-purple-600 hover:bg-purple-700">Connect Wallet</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Global Leaderboard</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Compete with the best chess players worldwide and climb the ranks to earn rewards and recognition
          </p>
        </div>

        <Tabs defaultValue="rankings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-purple-800/30 max-w-md mx-auto">
            <TabsTrigger value="rankings" className="data-[state=active]:bg-purple-600">
              Rankings
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-purple-600">
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rankings" className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {topPlayers.slice(0, 3).map((player, index) => (
                <Card
                  key={player.rank}
                  className={`bg-black/40 border-purple-800/30 backdrop-blur-sm ${index === 0 ? "ring-2 ring-yellow-500/50" : ""}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <Avatar className="h-20 w-20 mx-auto ring-4 ring-purple-500">
                        <AvatarImage src={`/placeholder.svg?height=80&width=80&query=${player.avatar}`} />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                      {index === 0 && <Crown className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400" />}
                      {index === 1 && <Medal className="absolute -top-2 -right-2 h-8 w-8 text-gray-400" />}
                      {index === 2 && <Medal className="absolute -top-2 -right-2 h-8 w-8 text-amber-600" />}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
                    <div className="text-3xl font-bold text-purple-400 mb-2">#{player.rank}</div>
                    <div className="text-lg text-yellow-400 mb-2">{player.rating}</div>
                    <div className="flex justify-center items-center space-x-2 text-sm text-gray-300">
                      <span>{player.country}</span>
                      <span>•</span>
                      <span>{player.winRate}% WR</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Rankings Table */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Global Rankings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Top players ranked by rating and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPlayers.map((player) => (
                    <div
                      key={player.rank}
                      className="flex items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl font-bold ${player.rank <= 3 ? "text-yellow-400" : "text-gray-400"}`}>
                          #{player.rank}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${player.avatar}`} />
                          <AvatarFallback>{player.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{player.name}</div>
                          <div className="text-gray-400 text-sm">{player.games} games played</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-white font-bold">{player.rating}</div>
                          <div className="text-gray-400 text-sm">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400 font-bold">{player.winRate}%</div>
                          <div className="text-gray-400 text-sm">Win Rate</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-bold ${player.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                          >
                            {player.change}
                          </div>
                          <div className="text-gray-400 text-sm">24h</div>
                        </div>
                        <div className="text-2xl">{player.country}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {tournaments.map((tournament, index) => (
                <Card key={index} className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{tournament.name}</CardTitle>
                      <Badge
                        className={
                          tournament.status === "Live"
                            ? "bg-green-600/20 text-green-300 border-green-600/30"
                            : tournament.status === "Registration"
                              ? "bg-blue-600/20 text-blue-300 border-blue-600/30"
                              : tournament.status === "Upcoming"
                                ? "bg-yellow-600/20 text-yellow-300 border-yellow-600/30"
                                : "bg-gray-600/20 text-gray-300 border-gray-600/30"
                        }
                      >
                        {tournament.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Prize Pool:</span>
                      <span className="text-yellow-400 font-bold">{tournament.prize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Participants:</span>
                      <span className="text-white">{tournament.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {tournament.status === "Completed" ? "Winner:" : "Time Left:"}
                      </span>
                      <span className="text-white">
                        {tournament.status === "Completed" ? tournament.winner : tournament.timeLeft}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={tournament.status === "Completed"}
                    >
                      {tournament.status === "Live"
                        ? "Join Now"
                        : tournament.status === "Registration"
                          ? "Register"
                          : tournament.status === "Upcoming"
                            ? "Set Reminder"
                            : "View Results"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Players:</span>
                    <span className="text-white font-bold">25,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Games Today:</span>
                    <span className="text-green-400 font-bold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Active Tournaments:</span>
                    <span className="text-purple-400 font-bold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Prize Pool:</span>
                    <span className="text-yellow-400 font-bold">50,000 CHESS</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { country: "🇺🇸 United States", players: 5420 },
                    { country: "🇷🇺 Russia", players: 4230 },
                    { country: "🇮🇳 India", players: 3890 },
                    { country: "🇩🇪 Germany", players: 2340 },
                    { country: "🇫🇷 France", players: 1980 },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-300">{item.country}</span>
                      <span className="text-white">{item.players.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="text-gray-300">
                      <span className="text-green-400">ChessMaster3000</span> won the Weekly Blitz
                    </div>
                    <div className="text-gray-300">
                      <span className="text-purple-400">QueenGambit</span> reached 2400 rating
                    </div>
                    <div className="text-gray-300">
                      New tournament <span className="text-yellow-400">NFT Masters Cup</span> announced
                    </div>
                    <div className="text-gray-300">
                      <span className="text-blue-400">KnightRider99</span> minted rare NFT piece
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
