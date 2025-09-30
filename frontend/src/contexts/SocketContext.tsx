"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinGame: (gameId: string) => void
  leaveGame: (gameId: string) => void
  makeMove: (gameId: string, move: any) => void
  sendChatMessage: (gameId: string, message: string) => void
  offerDraw: (gameId: string) => void
  respondToDraw: (gameId: string, accept: boolean) => void
  resign: (gameId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token') || 'demo-token' // Use demo token for testing
      },
      autoConnect: false,
      timeout: 10000,
      forceNew: true
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    // Connect when component mounts
    newSocket.connect()

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const joinGame = (gameId: string) => {
    if (socket) {
      socket.emit('join-game', gameId)
    }
  }

  const leaveGame = (gameId: string) => {
    if (socket) {
      socket.emit('leave-game', gameId)
    }
  }

  const makeMove = (gameId: string, move: any) => {
    if (socket) {
      socket.emit('make-move', { gameId, move })
    }
  }

  const sendChatMessage = (gameId: string, message: string) => {
    if (socket) {
      socket.emit('chat-message', { gameId, message })
    }
  }

  const offerDraw = (gameId: string) => {
    if (socket) {
      socket.emit('draw-offer', gameId)
    }
  }

  const respondToDraw = (gameId: string, accept: boolean) => {
    if (socket) {
      socket.emit('draw-response', { gameId, accept })
    }
  }

  const resign = (gameId: string) => {
    if (socket) {
      socket.emit('resign', gameId)
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    joinGame,
    leaveGame,
    makeMove,
    sendChatMessage,
    offerDraw,
    respondToDraw,
    resign
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
