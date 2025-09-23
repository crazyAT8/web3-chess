export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
export type PieceColor = "white" | "black"

export interface ChessPiece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

export interface ChessSquare {
  piece: ChessPiece | null
  isSelected: boolean
  isValidMove: boolean
  isInCheck: boolean
}

export interface Move {
  from: { row: number; col: number }
  to: { row: number; col: number }
  piece: ChessPiece
  capturedPiece?: ChessPiece
  isCastling?: boolean
  isEnPassant?: boolean
  isPromotion?: boolean
  promotionPiece?: PieceType
  san: string
  timestamp: number
}

export interface GameState {
  board: ChessSquare[][]
  currentPlayer: PieceColor
  gameStatus: "playing" | "check" | "checkmate" | "stalemate" | "draw"
  moveHistory: Move[]
  capturedPieces: { white: ChessPiece[]; black: ChessPiece[] }
  enPassantTarget?: { row: number; col: number }
  castlingRights: {
    white: { kingside: boolean; queenside: boolean }
    black: { kingside: boolean; queenside: boolean }
  }
  halfMoveClock: number
  fullMoveNumber: number
}

export const createInitialBoard = (): ChessSquare[][] => {
  const board: ChessSquare[][] = Array(8)
    .fill(null)
    .map(() =>
      Array(8)
        .fill(null)
        .map(() => ({
          piece: null,
          isSelected: false,
          isValidMove: false,
          isInCheck: false,
        })),
    )

  // Place black pieces
  const blackPieces: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
  blackPieces.forEach((type, col) => {
    board[0][col].piece = { type, color: "black", hasMoved: false }
  })
  for (let col = 0; col < 8; col++) {
    board[1][col].piece = { type: "pawn", color: "black", hasMoved: false }
  }

  // Place white pieces
  const whitePieces: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
  whitePieces.forEach((type, col) => {
    board[7][col].piece = { type, color: "white", hasMoved: false }
  })
  for (let col = 0; col < 8; col++) {
    board[6][col].piece = { type: "pawn", color: "white", hasMoved: false }
  }

  return board
}

export const createInitialGameState = (): GameState => {
  return {
    board: createInitialBoard(),
    currentPlayer: "white",
    gameStatus: "playing",
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    enPassantTarget: undefined,
    castlingRights: {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    },
    halfMoveClock: 0,
    fullMoveNumber: 1
  }
}

export const isValidMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][],
  gameState?: GameState
): boolean => {
  // Basic bounds checking
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false
  if (fromRow === toRow && fromCol === toCol) return false

  const targetPiece = board[toRow][toCol].piece
  if (targetPiece && targetPiece.color === piece.color) return false

  // Check if the move is valid for the piece type
  let isValidPieceMove = false

  switch (piece.type) {
    case "pawn":
      isValidPieceMove = isValidPawnMove(fromRow, fromCol, toRow, toCol, piece, board, gameState)
      break
    case "rook":
      isValidPieceMove = isValidRookMove(fromRow, fromCol, toRow, toCol, board)
      break
    case "bishop":
      isValidPieceMove = isValidBishopMove(fromRow, fromCol, toRow, toCol, board)
      break
    case "queen":
      isValidPieceMove = isValidQueenMove(fromRow, fromCol, toRow, toCol, board)
      break
    case "king":
      isValidPieceMove = isValidKingMove(fromRow, fromCol, toRow, toCol, piece, board, gameState)
      break
    case "knight":
      isValidPieceMove = isValidKnightMove(fromRow, fromCol, toRow, toCol)
      break
    default:
      return false
  }

  if (!isValidPieceMove) return false

  // Check if the move would put the king in check
  if (gameState && wouldMovePutKingInCheck(fromRow, fromCol, toRow, toCol, piece, board)) {
    return false
  }

  return true
}

const isValidPawnMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][],
  gameState?: GameState
): boolean => {
  const direction = piece.color === "white" ? -1 : 1
  const startRow = piece.color === "white" ? 6 : 1
  const targetPiece = board[toRow][toCol].piece
  const rowDiff = toRow - fromRow
  const colDiff = Math.abs(toCol - fromCol)

  // Forward move
  if (colDiff === 0) {
    if (targetPiece) return false // Can't capture forward
    if (rowDiff === direction) return true // Single square forward
    if (fromRow === startRow && rowDiff === 2 * direction) {
      // Two squares forward from starting position
      return !board[fromRow + direction][fromCol].piece // Path must be clear
    }
    return false
  }

  // Diagonal capture
  if (colDiff === 1 && rowDiff === direction) {
    if (targetPiece) return true // Normal capture
    // En passant capture
    if (gameState?.enPassantTarget && 
        toRow === gameState.enPassantTarget.row && 
        toCol === gameState.enPassantTarget.col) {
      return true
    }
  }

  return false
}

const isValidRookMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  board: ChessSquare[][]
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  if (rowDiff !== 0 && colDiff !== 0) return false // Must move in straight line
  return isPathClear(fromRow, fromCol, toRow, toCol, board)
}

const isValidBishopMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  board: ChessSquare[][]
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  if (rowDiff !== colDiff) return false // Must move diagonally
  return isPathClear(fromRow, fromCol, toRow, toCol, board)
}

const isValidQueenMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  board: ChessSquare[][]
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  if (rowDiff !== 0 && colDiff !== 0 && rowDiff !== colDiff) return false
  return isPathClear(fromRow, fromCol, toRow, toCol, board)
}

const isValidKingMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][],
  gameState?: GameState
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  // Normal king move (one square in any direction)
  if (rowDiff <= 1 && colDiff <= 1) return true

  // Castling
  if (rowDiff === 0 && colDiff === 2 && !piece.hasMoved) {
    return isValidCastling(fromRow, fromCol, toRow, toCol, piece, board, gameState)
  }

  return false
}

const isValidKnightMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
}

const isValidCastling = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][],
  gameState?: GameState
): boolean => {
  if (!gameState) return false

  const isKingside = toCol > fromCol
  const castlingRights = gameState.castlingRights[piece.color]
  
  if (!castlingRights.kingside && isKingside) return false
  if (!castlingRights.queenside && !isKingside) return false

  const rookCol = isKingside ? 7 : 0
  const rook = board[fromRow][rookCol].piece
  
  if (!rook || rook.type !== "rook" || rook.color !== piece.color || rook.hasMoved) {
    return false
  }

  // Check if path is clear
  const startCol = Math.min(fromCol, rookCol) + 1
  const endCol = Math.max(fromCol, rookCol)
  
  for (let col = startCol; col < endCol; col++) {
    if (board[fromRow][col].piece) return false
  }

  // Check if king would pass through or end up in check
  const kingPath = isKingside ? [6, 7] : [2, 3]
  for (const col of kingPath) {
    if (isSquareUnderAttack(fromRow, col, piece.color === "white" ? "black" : "white", board)) {
      return false
    }
  }

  return true
}

const isPathClear = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  board: ChessSquare[][],
): boolean => {
  const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
  const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0

  let currentRow = fromRow + rowStep
  let currentCol = fromCol + colStep

  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol].piece) return false
    currentRow += rowStep
    currentCol += colStep
  }

  return true
}

const wouldMovePutKingInCheck = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][]
): boolean => {
  // Create a temporary board with the move made
  const tempBoard = board.map(row => row.map(square => ({ ...square, piece: square.piece ? { ...square.piece } : null })))
  
  // Make the move on the temporary board
  tempBoard[toRow][toCol].piece = { ...piece, hasMoved: true }
  tempBoard[fromRow][fromCol].piece = null

  // Find the king's position after the move
  const kingRow = piece.type === "king" ? toRow : findKingPosition(piece.color, tempBoard).row
  const kingCol = piece.type === "king" ? toCol : findKingPosition(piece.color, tempBoard).col

  // Check if the king is under attack
  return isSquareUnderAttack(kingRow, kingCol, piece.color === "white" ? "black" : "white", tempBoard)
}

const findKingPosition = (color: PieceColor, board: ChessSquare[][]): { row: number; col: number } => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece
      if (piece && piece.type === "king" && piece.color === color) {
        return { row, col }
      }
    }
  }
  throw new Error(`King not found for ${color}`)
}

const isSquareUnderAttack = (
  row: number,
  col: number,
  byColor: PieceColor,
  board: ChessSquare[][]
): boolean => {
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol].piece
      if (piece && piece.color === byColor) {
        // Check if this piece can attack the target square
        if (canPieceAttackSquare(fromRow, fromCol, row, col, piece, board)) {
          return true
        }
      }
    }
  }
  return false
}

const canPieceAttackSquare = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][]
): boolean => {
  // This is similar to isValidMove but doesn't check for check or same color
  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  switch (piece.type) {
    case "pawn":
      const direction = piece.color === "white" ? -1 : 1
      return colDiff === 1 && toRow === fromRow + direction
    case "rook":
      return (rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol, board)
    case "bishop":
      return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol, board)
    case "queen":
      return ((rowDiff === 0 || colDiff === 0) || rowDiff === colDiff) && isPathClear(fromRow, fromCol, toRow, toCol, board)
    case "king":
      return rowDiff <= 1 && colDiff <= 1
    case "knight":
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
    default:
      return false
  }
}

export const isInCheck = (color: PieceColor, board: ChessSquare[][]): boolean => {
  const kingPos = findKingPosition(color, board)
  return isSquareUnderAttack(kingPos.row, kingPos.col, color === "white" ? "black" : "white", board)
}

export const isCheckmate = (color: PieceColor, board: ChessSquare[][], gameState: GameState): boolean => {
  if (!isInCheck(color, board)) return false
  
  // Check if any legal move exists
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol].piece
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(fromRow, fromCol, toRow, toCol, piece, board, gameState)) {
              return false // Found a legal move
            }
          }
        }
      }
    }
  }
  return true
}

export const isStalemate = (color: PieceColor, board: ChessSquare[][], gameState: GameState): boolean => {
  if (isInCheck(color, board)) return false
  
  // Check if any legal move exists
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol].piece
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(fromRow, fromCol, toRow, toCol, piece, board, gameState)) {
              return false // Found a legal move
            }
          }
        }
      }
    }
  }
  return true
}

export const makeMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  gameState: GameState,
  promotionPiece?: PieceType
): GameState => {
  const piece = gameState.board[fromRow][fromCol].piece
  if (!piece) throw new Error("No piece at source square")

  if (!isValidMove(fromRow, fromCol, toRow, toCol, piece, gameState.board, gameState)) {
    throw new Error("Invalid move")
  }

  const newBoard = gameState.board.map(row => 
    row.map(square => ({ ...square, piece: square.piece ? { ...square.piece } : null }))
  )

  const capturedPiece = newBoard[toRow][toCol].piece
  const isEnPassant = piece.type === "pawn" && 
    gameState.enPassantTarget && 
    toRow === gameState.enPassantTarget.row && 
    toCol === gameState.enPassantTarget.col

  // Handle en passant capture
  if (isEnPassant) {
    const capturedPawnRow = piece.color === "white" ? toRow + 1 : toRow - 1
    newBoard[capturedPawnRow][toCol].piece = null
  }

  // Make the move
  newBoard[toRow][toCol].piece = { ...piece, hasMoved: true }
  newBoard[fromRow][fromCol].piece = null

  // Handle castling
  if (piece.type === "king" && Math.abs(toCol - fromCol) === 2) {
    const isKingside = toCol > fromCol
    const rookFromCol = isKingside ? 7 : 0
    const rookToCol = isKingside ? 5 : 3
    
    const rook = newBoard[fromRow][rookFromCol].piece
    if (rook) {
      newBoard[fromRow][rookToCol].piece = { ...rook, hasMoved: true }
      newBoard[fromRow][rookFromCol].piece = null
    }
  }

  // Handle pawn promotion
  if (piece.type === "pawn" && (toRow === 0 || toRow === 7)) {
    const promotedPiece = promotionPiece || "queen"
    newBoard[toRow][toCol].piece = { type: promotedPiece, color: piece.color, hasMoved: true }
  }

  // Update castling rights
  const newCastlingRights = { ...gameState.castlingRights }
  if (piece.type === "king") {
    newCastlingRights[piece.color] = { kingside: false, queenside: false }
  } else if (piece.type === "rook") {
    if (fromCol === 0) newCastlingRights[piece.color].queenside = false
    if (fromCol === 7) newCastlingRights[piece.color].kingside = false
  }

  // Update en passant target
  let newEnPassantTarget = undefined
  if (piece.type === "pawn" && Math.abs(toRow - fromRow) === 2) {
    newEnPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol }
  }

  // Update captured pieces
  const newCapturedPieces = { ...gameState.capturedPieces }
  if (capturedPiece) {
    newCapturedPieces[capturedPiece.color].push(capturedPiece)
  }

  // Create move record
  const move: Move = {
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
    piece: piece,
    capturedPiece: capturedPiece || undefined,
    isCastling: piece.type === "king" && Math.abs(toCol - fromCol) === 2,
    isEnPassant: isEnPassant,
    isPromotion: piece.type === "pawn" && (toRow === 0 || toRow === 7),
    promotionPiece: promotionPiece,
    san: generateSAN(fromRow, fromCol, toRow, toCol, piece, capturedPiece || undefined, isEnPassant),
    timestamp: Date.now()
  }

  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentPlayer: gameState.currentPlayer === "white" ? "black" : "white",
    moveHistory: [...gameState.moveHistory, move],
    capturedPieces: newCapturedPieces,
    enPassantTarget: newEnPassantTarget,
    castlingRights: newCastlingRights,
    halfMoveClock: capturedPiece || piece.type === "pawn" ? 0 : gameState.halfMoveClock + 1,
    fullMoveNumber: gameState.currentPlayer === "black" ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber
  }

  // Check for check, checkmate, or stalemate
  const opponentColor = gameState.currentPlayer === "white" ? "black" : "white"
  if (isCheckmate(opponentColor, newBoard, newGameState)) {
    newGameState.gameStatus = "checkmate"
  } else if (isStalemate(opponentColor, newBoard, newGameState)) {
    newGameState.gameStatus = "stalemate"
  } else if (isInCheck(opponentColor, newBoard)) {
    newGameState.gameStatus = "check"
  } else {
    newGameState.gameStatus = "playing"
  }

  return newGameState
}

const generateSAN = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  capturedPiece?: ChessPiece,
  isEnPassant?: boolean
): string => {
  const files = "abcdefgh"
  const fromFile = files[fromCol]
  const toFile = files[toCol]
  const toRank = 8 - toRow

  if (piece.type === "pawn") {
    if (capturedPiece || isEnPassant) {
      return `${fromFile}x${toFile}${toRank}`
    }
    return `${toFile}${toRank}`
  }

  const pieceSymbol = piece.type === "knight" ? "N" : piece.type.charAt(0).toUpperCase()
  const capture = capturedPiece ? "x" : ""
  
  return `${pieceSymbol}${capture}${toFile}${toRank}`
}

export const getPieceSymbol = (piece: ChessPiece): string => {
  const symbols: Record<PieceType, Record<PieceColor, string>> = {
    king: { white: "♔", black: "♚" },
    queen: { white: "♕", black: "♛" },
    rook: { white: "♖", black: "♜" },
    bishop: { white: "♗", black: "♝" },
    knight: { white: "♘", black: "♞" },
    pawn: { white: "♙", black: "♟" },
  }
  return symbols[piece.type][piece.color]
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const boardToFEN = (gameState: GameState): string => {
  let fen = ""
  
  // Board position
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col].piece
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount
          emptyCount = 0
        }
        const symbol = piece.type === "knight" ? "N" : piece.type.charAt(0).toUpperCase()
        fen += piece.color === "white" ? symbol : symbol.toLowerCase()
      } else {
        emptyCount++
      }
    }
    if (emptyCount > 0) {
      fen += emptyCount
    }
    if (row < 7) fen += "/"
  }
  
  // Active color
  fen += ` ${gameState.currentPlayer === "white" ? "w" : "b"}`
  
  // Castling rights
  let castling = ""
  if (gameState.castlingRights.white.kingside) castling += "K"
  if (gameState.castlingRights.white.queenside) castling += "Q"
  if (gameState.castlingRights.black.kingside) castling += "k"
  if (gameState.castlingRights.black.queenside) castling += "q"
  fen += ` ${castling || "-"}`
  
  // En passant target
  if (gameState.enPassantTarget) {
    const files = "abcdefgh"
    fen += ` ${files[gameState.enPassantTarget.col]}${8 - gameState.enPassantTarget.row}`
  } else {
    fen += " -"
  }
  
  // Halfmove clock and fullmove number
  fen += ` ${gameState.halfMoveClock} ${gameState.fullMoveNumber}`
  
  return fen
}

export const FENToBoard = (fen: string): GameState => {
  const parts = fen.split(" ")
  const boardFEN = parts[0]
  const activeColor = parts[1] as PieceColor
  const castling = parts[2]
  const enPassant = parts[3]
  const halfMoveClock = parseInt(parts[4]) || 0
  const fullMoveNumber = parseInt(parts[5]) || 1
  
  const board = createInitialBoard()
  
  // Parse board position
  const rows = boardFEN.split("/")
  for (let row = 0; row < 8; row++) {
    let col = 0
    for (const char of rows[row]) {
      if (char >= "1" && char <= "8") {
        // Empty squares
        col += parseInt(char)
      } else {
        // Piece
        const isWhite = char === char.toUpperCase()
        const pieceType = char.toLowerCase() === "n" ? "knight" : 
          char.toLowerCase() === "p" ? "pawn" :
          char.toLowerCase() === "r" ? "rook" :
          char.toLowerCase() === "b" ? "bishop" :
          char.toLowerCase() === "q" ? "queen" : "king"
        
        board[row][col].piece = {
          type: pieceType as PieceType,
          color: isWhite ? "white" : "black",
          hasMoved: true // Assume moved if loading from FEN
        }
        col++
      }
    }
  }
  
  // Parse castling rights
  const castlingRights = {
    white: { kingside: castling.includes("K"), queenside: castling.includes("Q") },
    black: { kingside: castling.includes("k"), queenside: castling.includes("q") }
  }
  
  // Parse en passant target
  let enPassantTarget = undefined
  if (enPassant !== "-") {
    const files = "abcdefgh"
    const col = files.indexOf(enPassant[0])
    const row = 8 - parseInt(enPassant[1])
    enPassantTarget = { row, col }
  }
  
  return {
    board,
    currentPlayer: activeColor,
    gameStatus: "playing",
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    enPassantTarget,
    castlingRights,
    halfMoveClock,
    fullMoveNumber
  }
}

export const getValidMoves = (row: number, col: number, gameState: GameState): Array<{row: number, col: number}> => {
  const piece = gameState.board[row][col].piece
  if (!piece || piece.color !== gameState.currentPlayer) return []
  
  const validMoves: Array<{row: number, col: number}> = []
  
  for (let toRow = 0; toRow < 8; toRow++) {
    for (let toCol = 0; toCol < 8; toCol++) {
      if (isValidMove(row, col, toRow, toCol, piece, gameState.board, gameState)) {
        validMoves.push({ row: toRow, col: toCol })
      }
    }
  }
  
  return validMoves
}
