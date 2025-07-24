"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Clock, Coins } from "lucide-react"
import Link from "next/link"

type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
type PieceColor = "white" | "black"

interface Piece {
  type: PieceType
  color: PieceColor
}

interface Square {
  piece: Piece | null
  isSelected: boolean
  isValidMove: boolean
}

const initialBoard: Square[][] = [
  [
    { piece: { type: "rook", color: "black" }, isSelected: false, isValidMove: false },
    { piece: { type: "knight", color: "black" }, isSelected: false, isValidMove: false },
    { piece: { type: "bishop", color: "black" }, isSelected: false, isValidMove: false },
    { piece: { type: "queen", color: "black" }, isSelected: false, isValidMove: false },
    { piece: { type: "king", color: "black" }, isSelected: false, isValidMove: false },
    { piece: { type: "bishop", color: "black" }, isSelected: false, isValidMove: false },
    { piece: { type: "knight", color: "black" }, isSelected: false, isValidMove: false },
    { piece: { type: "rook", color: "black" }, isSelected: false, isValidMove: false },
  ],
  Array(8)
    .fill(null)
    .map(() => ({ piece: { type: "pawn", color: "black" }, isSelected: false, isValidMove: false })),
  ...Array(4)
    .fill(null)
    .map(() =>
      Array(8)
        .fill(null)
        .map(() => ({ piece: null, isSelected: false, isValidMove: false })),
    ),
  Array(8)
    .fill(null)
    .map(() => ({ piece: { type: "pawn", color: "white" }, isSelected: false, isValidMove: false })),
  [
    { piece: { type: "rook", color: "white" }, isSelected: false, isValidMove: false },
    { piece: { type: "knight", color: "white" }, isSelected: false, isValidMove: false },
    { piece: { type: "bishop", color: "white" }, isSelected: false, isValidMove: false },
    { piece: { type: "queen", color: "white" }, isSelected: false, isValidMove: false },
    { piece: { type: "king", color: "white" }, isSelected: false, isValidMove: false },
    { piece: { type: "bishop", color: "white" }, isSelected: false, isValidMove: false },
    { piece: { type: "knight", color: "white" }, isSelected: false, isValidMove: false },
    { piece: { type: "rook", color: "white" }, isSelected: false, isValidMove: false },
  ],
]

const pieceSymbols: Record<PieceType, Record<PieceColor, string>> = {
  king: { white: "♔", black: "♚" },
  queen: { white: "♕", black: "♛" },
  rook: { white: "♖", black: "♜" },
  bishop: { white: "♗", black: "♝" },
  knight: { white: "♘", black: "♞" },
  pawn: { white: "♙", black: "♟" },
}

export default function Game() {
  const [board, setBoard] = useState<Square[][]>(initialBoard)
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [gameTime, setGameTime] = useState({ white: 600, black: 600 }) // 10 minutes each
  const [gameStatus, setGameStatus] = useState<"playing" | "check" | "checkmate" | "draw">("playing")

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (selectedSquare) {
        const [selectedRow, selectedCol] = selectedSquare
        const newBoard = board.map((r) => r.map((s) => ({ ...s, isSelected: false, isValidMove: false })))

        // Move piece if valid
        if (board[row][col].isValidMove) {
          newBoard[row][col].piece = board[selectedRow][selectedCol].piece
          newBoard[selectedRow][selectedCol].piece = null
          setCurrentPlayer(currentPlayer === "white" ? "black" : "white")
        }

        setBoard(newBoard)
        setSelectedSquare(null)
      } else {
        // Select piece
        const piece = board[row][col].piece
        if (piece && piece.color === currentPlayer) {
          const newBoard = board.map((r, rIndex) =>
            r.map((s, cIndex) => ({
              ...s,
              isSelected: rIndex === row && cIndex === col,
              isValidMove:
                rIndex === row && cIndex === col ? false : isValidMove(row, col, rIndex, cIndex, piece, board),
            })),
          )
          setBoard(newBoard)
          setSelectedSquare([row, col])
        }
      }
    },
    [board, selectedSquare, currentPlayer],
  )

  const isValidMove = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    piece: Piece,
    board: Square[][],
  ): boolean => {
    // Simplified move validation - in a real game, this would be much more complex
    const targetPiece = board[toRow][toCol].piece
    if (targetPiece && targetPiece.color === piece.color) return false

    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)

    switch (piece.type) {
      case "pawn":
        const direction = piece.color === "white" ? -1 : 1
        const startRow = piece.color === "white" ? 6 : 1
        if (colDiff === 0) {
          if (toRow === fromRow + direction && !targetPiece) return true
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) return true
        } else if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
          return true
        }
        return false
      case "rook":
        return rowDiff === 0 || colDiff === 0
      case "bishop":
        return rowDiff === colDiff
      case "queen":
        return rowDiff === 0 || colDiff === 0 || rowDiff === colDiff
      case "king":
        return rowDiff <= 1 && colDiff <= 1
      case "knight":
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      default:
        return false
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
                  className={`flex items-center space-x-3 p-3 rounded-lg ${currentPlayer === "black" ? "bg-purple-600/20 border border-purple-600/30" : ""}`}
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
                      {formatTime(gameTime.black)}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${currentPlayer === "white" ? "bg-purple-600/20 border border-purple-600/30" : ""}`}
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
                      {formatTime(gameTime.white)}
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
                  <Badge className="bg-green-600/20 text-green-300 border-green-600/30">{gameStatus}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Turn:</span>
                  <span className="text-white capitalize">{currentPlayer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Moves:</span>
                  <span className="text-white">12</span>
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

            {/* Captured Pieces */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Captured</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-gray-300 text-sm mb-1">Black:</div>
                    <div className="text-2xl">♙♗</div>
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm mb-1">White:</div>
                    <div className="text-2xl">♟♞</div>
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
                    {board.map((row, rowIndex) =>
                      row.map((square, colIndex) => (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            aspect-square flex items-center justify-center text-4xl font-bold transition-all duration-200
                            ${(rowIndex + colIndex) % 2 === 0 ? "bg-amber-100" : "bg-amber-800"}
                            ${square.isSelected ? "ring-4 ring-purple-500" : ""}
                            ${square.isValidMove ? "ring-2 ring-green-500 bg-green-200/20" : ""}
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
                              {pieceSymbols[square.piece.type][square.piece.color]}
                            </span>
                          )}
                          {square.isValidMove && !square.piece && (
                            <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />
                          )}
                        </button>
                      )),
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
