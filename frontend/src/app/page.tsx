import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Shield, Coins, Users, Trophy, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">ChessFi</h1>
          </div>
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
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
              Profile
            </Link>
          </nav>
          <Button className="bg-purple-600 hover:bg-purple-700">Connect Wallet</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-purple-600/20 text-purple-300 border-purple-600/30">Web3 Gaming Revolution</Badge>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Chess Meets
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" "}
              Blockchain
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the future of chess with NFT avatars, smart contract tournaments, and true ownership of your
            digital assets. Play, earn, and compete in the decentralized chess metaverse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/game">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                <Zap className="mr-2 h-5 w-5" />
                Start Playing
              </Button>
            </Link>
            <Link href="/mint">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-600/10 text-lg px-8 py-3 bg-transparent"
              >
                <Crown className="mr-2 h-5 w-5" />
                Mint Avatar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">Why Choose ChessFi?</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Revolutionary features that transform traditional chess into a decentralized gaming experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">NFT Avatars</CardTitle>
              <CardDescription className="text-gray-300">
                Unique digital avatars as NFTs that represent your in-game presence
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <Coins className="h-12 w-12 text-yellow-400 mb-4" />
              <CardTitle className="text-white">Tokenized Rewards</CardTitle>
              <CardDescription className="text-gray-300">
                Earn cryptocurrency and tokens based on your performance and participation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <Users className="h-12 w-12 text-green-400 mb-4" />
              <CardTitle className="text-white">Peer-to-Peer</CardTitle>
              <CardDescription className="text-gray-300">
                Direct player challenges without centralized servers or intermediaries
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <Trophy className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle className="text-white">Smart Contracts</CardTitle>
              <CardDescription className="text-gray-300">
                Automated game processes with transparent winner determination
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <Crown className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">True Ownership</CardTitle>
              <CardDescription className="text-gray-300">
                Own, trade, and sell your chess pieces, boards, and collectibles as NFTs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Decentralized</CardTitle>
              <CardDescription className="text-gray-300">
                Censorship-resistant gaming with no central authority control
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">10,000+</div>
            <div className="text-gray-300">Active Players</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">50,000+</div>
            <div className="text-gray-300">Games Played</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">5,000+</div>
            <div className="text-gray-300">NFTs Minted</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-400 mb-2">$100K+</div>
            <div className="text-gray-300">Rewards Distributed</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span className="text-white font-semibold">ChessFi</span>
            </div>
            <div className="text-gray-400 text-sm">© 2024 ChessFi. Decentralized chess gaming platform.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}





// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }


