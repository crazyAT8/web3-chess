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
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [maxReconnectAttempts] = useState(5)

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
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      setReconnectAttempts(0)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      setIsConnected(false)
      
      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        console.log('Server disconnected, not attempting reconnection')
      } else {
        // Client initiated disconnect, attempt reconnection
        console.log('Client disconnected, will attempt reconnection')
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
      setReconnectAttempts(prev => prev + 1)
      
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
      setReconnectAttempts(0)
    })

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt', attemptNumber)
    })

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('Reconnection failed after all attempts')
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
  }, [maxReconnectAttempts, reconnectAttempts])

  const joinGame = (gameId: string) => {
    if (socket && isConnected) {
      if (!gameId || typeof gameId !== 'string') {
        console.error('Invalid gameId provided to joinGame')
        return
      }
      socket.emit('join-game', gameId)
    } else {
      console.warn('Socket not connected, cannot join game')
    }
  }

  const leaveGame = (gameId: string) => {
    if (socket && isConnected) {
      if (!gameId || typeof gameId !== 'string') {
        console.error('Invalid gameId provided to leaveGame')
        return
      }
      socket.emit('leave-game', gameId)
    } else {
      console.warn('Socket not connected, cannot leave game')
    }
  }

  const makeMove = (gameId: string, move: any) => {
    if (socket && isConnected) {
      if (!gameId || typeof gameId !== 'string') {
        console.error('Invalid gameId provided to makeMove')
        return
      }
      if (!move || !move.from || !move.to) {
        console.error('Invalid move provided to makeMove')
        return
      }
      socket.emit('make-move', { gameId, move })
    } else {
      console.warn('Socket not connected, cannot make move')
    }
  }

  const sendChatMessage = (gameId: string, message: string) => {
    if (socket && isConnected) {
      if (!gameId || typeof gameId !== 'string') {
        console.error('Invalid gameId provided to sendChatMessage')
        return
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        console.error('Invalid message provided to sendChatMessage')
        return
      }
      socket.emit('chat-message', { gameId, message: message.trim() })
    } else {
      console.warn('Socket not connected, cannot send chat message')
    }
  }

  const offerDraw = (gameId: string) => {
    if (socket && isConnected) {
      if (!gameId || typeof gameId !== 'string') {
        console.error('Invalid gameId provided to offerDraw')
        return
      }
      socket.emit('draw-offer', gameId)
    } else {
      console.warn('Socket not connected, cannot offer draw')
    }
  }

  const respondToDraw = (gameId: string, accept: boolean) => {
    if (socket && isConnected) {
      if (!gameId || typeof gameId !== 'string') {
        console.error('Invalid gameId provided to respondToDraw')
        return
      }
      if (typeof accept !== 'boolean') {
        console.error('Invalid accept parameter provided to respondToDraw')
        return
      }
      socket.emit('draw-response', { gameId, accept })
    } else {
      console.warn('Socket not connected, cannot respond to draw')
    }
  }

  const resign = (gameId: string) => {
    if (socket && isConnected) {
      if (!gameId || typeof gameId !== 'string') {
        console.error('Invalid gameId provided to resign')
        return
      }
      socket.emit('resign', gameId)
    } else {
      console.warn('Socket not connected, cannot resign')
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
