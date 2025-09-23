"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Clock, Coins } from "lucide-react"
import Link from "next/link"
import { GameCreationForm } from "@/components/contracts/GameCreationForm"
import { ContractTester } from "@/components/contracts/ContractTester"
import { 
  createInitialGameState, 
  isValidMove, 
  makeMove, 
  getPieceSymbol, 
  formatTime,
  type GameState
} from "@/components/chess-utils"

// Use the chess engine's initial game state
const initialGameState = createInitialGameState()

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [whiteTime] = useState(600) // 10 minutes
  const [blackTime] = useState(600) // 10 minutes

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (selectedSquare) {
        const [selectedRow, selectedCol] = selectedSquare
        const piece = gameState.board[selectedRow][selectedCol].piece

        if (piece && isValidMove(selectedRow, selectedCol, row, col, piece, gameState.board, gameState)) {
          try {
            const newGameState = makeMove(selectedRow, selectedCol, row, col, gameState)
            setGameState(newGameState)
          } catch (error) {
            console.error("Invalid move:", error)
          }
        }

        setSelectedSquare(null)
      } else {
        // Select piece
        const piece = gameState.board[row][col].piece
        if (piece && piece.color === gameState.currentPlayer) {
          setSelectedSquare([row, col])
        }
      }
    },
    [gameState, selectedSquare],
  )


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">ChessFi</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-600/20 text-green-300 border-green-600/30">Live Game</Badge>
            <Button variant="outline" className="border-purple-600 text-purple-300 bg-transparent">
              Forfeit
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Game Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Players */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${gameState.currentPlayer === "black" ? "bg-purple-600/20 border border-purple-600/30" : ""}`}
                >
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>BK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white font-medium">BlackKnight</div>
                    <div className="text-gray-400 text-sm">Rating: 1850</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {formatTime(blackTime)}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${gameState.currentPlayer === "white" ? "bg-purple-600/20 border border-purple-600/30" : ""}`}
                >
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>WK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white font-medium">WhiteKing</div>
                    <div className="text-gray-400 text-sm">Rating: 1920</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {formatTime(whiteTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <Badge className="bg-green-600/20 text-green-300 border-green-600/30">{gameState.gameStatus}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Turn:</span>
                  <span className="text-white capitalize">{gameState.currentPlayer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Moves:</span>
                  <span className="text-white">{gameState.moveHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Stake:</span>
                  <span className="text-yellow-400">
                    <Coins className="inline h-4 w-4 mr-1" />
                    50 CHESS
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contract Tester */}
            <ContractTester />

            {/* Game Creation Form */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Create or Join Game</CardTitle>
              </CardHeader>
              <CardContent>
                <GameCreationForm />
              </CardContent>
            </Card>

            {/* Captured Pieces */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Captured</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-gray-300 text-sm mb-1">Black:</div>
                    <div className="text-2xl">
                      {gameState.capturedPieces.black.map((piece, index) => (
                        <span key={index}>{getPieceSymbol(piece)}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm mb-1">White:</div>
                    <div className="text-2xl">
                      {gameState.capturedPieces.white.map((piece, index) => (
                        <span key={index}>{getPieceSymbol(piece)}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-3">
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="aspect-square max-w-2xl mx-auto">
                  <div className="grid grid-cols-8 gap-0 border-2 border-purple-600/30 rounded-lg overflow-hidden">
                    {gameState.board.map((row, rowIndex) =>
                      row.map((square, colIndex) => {
                        const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex
                        const piece = square.piece
                        const isMoveValid = piece && selectedSquare && 
                          isValidMove(selectedSquare[0], selectedSquare[1], rowIndex, colIndex, piece, gameState.board, gameState)
                        
                        return (
                          <button
                            key={`${rowIndex}-${colIndex}`}
                            className={`
                              aspect-square flex items-center justify-center text-4xl font-bold transition-all duration-200
                              ${(rowIndex + colIndex) % 2 === 0 ? "bg-amber-100" : "bg-amber-800"}
                              ${isSelected ? "ring-4 ring-purple-500" : ""}
                              ${isMoveValid ? "ring-2 ring-green-500 bg-green-200/20" : ""}
                              hover:brightness-110
                            `}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                          >
                            {square.piece && (
                              <span
                                className={
                                  square.piece.color === "white"
                                    ? "text-white drop-shadow-lg"
                                    : "text-black drop-shadow-lg"
                                }
                              >
                                {getPieceSymbol(square.piece)}
                              </span>
                            )}
                            {isMoveValid && !square.piece && (
                              <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />
                            )}
                          </button>
                        )
                      }),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
