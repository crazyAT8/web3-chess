"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Clock, Coins, RotateCcw } from "lucide-react"
import Link from "next/link"
import { GameCreationForm } from "@/components/contracts/GameCreationForm"
import { ContractTester } from "@/components/contracts/ContractTester"
import { 
  createInitialGameState, 
  isValidMove, 
  makeMove, 
  getValidMoves,
  getPieceSymbol, 
  formatTime,
  FENToBoard,
  createGameStateFromBackend,
  type GameState
} from "@/components/chess-utils"
import { useSocket } from "@/contexts/SocketContext"

// Use the chess engine's initial game state
const initialGameState = createInitialGameState()

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [whiteTime] = useState(600) // 10 minutes
  const [blackTime] = useState(600) // 10 minutes
  const [gameId, setGameId] = useState<string | null>(null)
  const [isConnected] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [lastMoveTimestamp, setLastMoveTimestamp] = useState<number>(0)
  
  const { socket, isConnected: socketConnected, joinGame, makeMove: socketMakeMove, sendChatMessage } = useSocket()

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return

    const handleMoveMade = (data: any) => {
      console.log('Move received:', data)
      // Update game state with the received move
      if (data.gameState?.currentFen) {
        try {
          const newGameState = FENToBoard(data.gameState.currentFen)
          setGameState(newGameState)
          
          // Update last move timestamp
          if (data.timestamp) {
            setLastMoveTimestamp(new Date(data.timestamp).getTime())
          }
        } catch (error) {
          console.error('Error parsing FEN from move:', error)
        }
      }
    }

    const handleGameState = (data: any) => {
      console.log('Game state received:', data)
      if (data.game) {
        try {
          const newGameState = createGameStateFromBackend(data.game)
          setGameState(newGameState)
        } catch (error) {
          console.error('Error creating game state from backend data:', error)
        }
      }
    }

    const handleGameStateUpdated = (data: any) => {
      console.log('Game state updated:', data)
      if (data.game) {
        try {
          const newGameState = createGameStateFromBackend(data.game)
          setGameState(newGameState)
        } catch (error) {
          console.error('Error creating game state from updated data:', error)
        }
      }
    }

    const handleGameEnded = (data: any) => {
      console.log('Game ended:', data)
      // Update game status to reflect the end
      setGameState(prev => ({
        ...prev,
        gameStatus: data.result === 'draw' ? 'draw' : 'checkmate'
      }))
    }

    const handleChatMessage = (data: any) => {
      setChatMessages(prev => [...prev, data])
    }

    const handleError = (error: any) => {
      console.error('Socket error:', error)
    }

    const handlePlayerJoined = (data: any) => {
      console.log('Player joined:', data)
    }

    const handlePlayerLeft = (data: any) => {
      console.log('Player left:', data)
    }

    const handlePlayerDisconnected = (data: any) => {
      console.log('Player disconnected:', data)
    }

    // Register all event listeners
    socket.on('move-made', handleMoveMade)
    socket.on('game-state', handleGameState)
    socket.on('game-state-updated', handleGameStateUpdated)
    socket.on('game-ended', handleGameEnded)
    socket.on('chat-message', handleChatMessage)
    socket.on('error', handleError)
    socket.on('player-joined', handlePlayerJoined)
    socket.on('player-left', handlePlayerLeft)
    socket.on('player-disconnected', handlePlayerDisconnected)

    return () => {
      // Clean up all event listeners
      socket.off('move-made', handleMoveMade)
      socket.off('game-state', handleGameState)
      socket.off('game-state-updated', handleGameStateUpdated)
      socket.off('game-ended', handleGameEnded)
      socket.off('chat-message', handleChatMessage)
      socket.off('error', handleError)
      socket.off('player-joined', handlePlayerJoined)
      socket.off('player-left', handlePlayerLeft)
      socket.off('player-disconnected', handlePlayerDisconnected)
    }
  }, [socket])

  // Game state persistence
  useEffect(() => {
    if (gameId) {
      const gameStateKey = `chess-game-${gameId}`
      localStorage.setItem(gameStateKey, JSON.stringify({
        gameState,
        lastMoveTimestamp,
        chatMessages
      }))
    }
  }, [gameState, lastMoveTimestamp, chatMessages, gameId])

  // Load game state from localStorage on mount
  useEffect(() => {
    if (gameId) {
      const gameStateKey = `chess-game-${gameId}`
      const savedState = localStorage.getItem(gameStateKey)
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          if (parsed.gameState) {
            setGameState(parsed.gameState)
          }
          if (parsed.chatMessages) {
            setChatMessages(parsed.chatMessages)
          }
          if (parsed.lastMoveTimestamp) {
            setLastMoveTimestamp(parsed.lastMoveTimestamp)
          }
        } catch (error) {
          console.error('Error loading saved game state:', error)
        }
      }
    }
  }, [gameId])

  // Join game when component mounts (for demo purposes)
  useEffect(() => {
    if (socketConnected && !gameId) {
      // For demo, create a mock game ID
      const mockGameId = 'demo-game-123'
      setGameId(mockGameId)
      joinGame(mockGameId)
    }
  }, [socketConnected, gameId, joinGame])

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (selectedSquare) {
        const [selectedRow, selectedCol] = selectedSquare
        const piece = gameState.board[selectedRow][selectedCol].piece

        if (piece && isValidMove(selectedRow, selectedCol, row, col, piece, gameState.board, gameState)) {
          try {
            // Send move to server via Socket.IO (if connected)
            if (gameId && socketMakeMove && socketConnected) {
              const move = {
                from: `${String.fromCharCode(97 + selectedCol)}${8 - selectedRow}`,
                to: `${String.fromCharCode(97 + col)}${8 - row}`,
                promotion: undefined // Add promotion logic if needed
              }
              socketMakeMove(gameId, move)
            } else if (!socketConnected) {
              // Make move locally only if not connected to server
              const newGameState = makeMove(selectedRow, selectedCol, row, col, gameState)
              setGameState(newGameState)
              console.log('Socket not connected, playing locally only')
            }
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
    [gameState, selectedSquare, gameId, socketConnected, socketMakeMove],
  )

  // Get valid moves for the selected piece
  const getValidMovesForSelected = useCallback(() => {
    if (!selectedSquare) return []
    const [row, col] = selectedSquare
    return getValidMoves(row, col, gameState)
  }, [selectedSquare, gameState])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState())
    setSelectedSquare(null)
  }, [])

  // Handle chat message send
  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && gameId && sendChatMessage) {
      sendChatMessage(gameId, newMessage.trim())
      setNewMessage("")
    }
  }, [newMessage, gameId, sendChatMessage])


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
            <Badge className={socketConnected ? "bg-green-600/20 text-green-300 border-green-600/30" : "bg-red-600/20 text-red-300 border-red-600/30"}>
              {socketConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </Badge>
            <Badge className="bg-green-600/20 text-green-300 border-green-600/30">Live Game</Badge>
            <Button 
              onClick={resetGame}
              variant="outline" 
              className="border-blue-600 text-blue-300 bg-transparent hover:bg-blue-600/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" className="border-red-600 text-red-300 bg-transparent hover:bg-red-600/10">
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

            {/* Move History */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Move History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {gameState.moveHistory.length === 0 ? (
                    <div className="text-gray-400 text-sm">No moves yet</div>
                  ) : (
                    gameState.moveHistory.map((move, index) => (
                      <div key={index} className="text-sm text-gray-300 flex justify-between">
                        <span>{index + 1}.</span>
                        <span className="font-mono">{move.san}</span>
                      </div>
                    ))
                  )}
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

            {/* Chat */}
            <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-32 overflow-y-auto space-y-2">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-blue-400 font-medium">{msg.username}:</span>
                        <span className="text-gray-300 ml-2">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Send
                    </Button>
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
                        const validMoves = getValidMovesForSelected()
                        const isValidMoveSquare = validMoves.some((move: {row: number, col: number}) => move.row === rowIndex && move.col === colIndex)
                        const isLastMove = gameState.moveHistory.length > 0 && 
                          ((gameState.moveHistory[gameState.moveHistory.length - 1].from.row === rowIndex && 
                            gameState.moveHistory[gameState.moveHistory.length - 1].from.col === colIndex) ||
                           (gameState.moveHistory[gameState.moveHistory.length - 1].to.row === rowIndex && 
                            gameState.moveHistory[gameState.moveHistory.length - 1].to.col === colIndex))
                        
                        return (
                          <button
                            key={`${rowIndex}-${colIndex}`}
                            className={`
                              aspect-square flex items-center justify-center text-4xl font-bold transition-all duration-200 relative
                              ${(rowIndex + colIndex) % 2 === 0 ? "bg-amber-100" : "bg-amber-800"}
                              ${isSelected ? "ring-4 ring-purple-500 bg-purple-200/30" : ""}
                              ${isValidMoveSquare ? "ring-2 ring-green-500 bg-green-200/20" : ""}
                              ${isLastMove ? "ring-2 ring-yellow-500 bg-yellow-200/20" : ""}
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
                            {isValidMoveSquare && !square.piece && (
                              <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />
                            )}
                            {isValidMoveSquare && square.piece && (
                              <div className="absolute inset-0 border-2 border-green-500 rounded-sm" />
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
