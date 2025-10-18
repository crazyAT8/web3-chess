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
  pendingPromotion?: { row: number; col: number; piece: ChessPiece }
  positionHistory: string[]
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
    fullMoveNumber: 1,
    pendingPromotion: undefined,
    positionHistory: ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1']
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

  // Check if piece is pinned (would expose king if moved)
  if (gameState && isPiecePinned(fromRow, fromCol, toRow, toCol, piece, board)) {
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
      // Verify there's actually an opponent pawn to capture
      const capturedPawnRow = piece.color === "white" ? toRow + 1 : toRow - 1
      const capturedPawn = board[capturedPawnRow][toCol].piece
      return !!(capturedPawn && 
             capturedPawn.type === "pawn" && 
             capturedPawn.color !== piece.color)
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
  if (rowDiff <= 1 && colDiff <= 1) {
    // Check if the destination square is under attack
    if (gameState) {
      const opponentColor = piece.color === "white" ? "black" : "white"
      return !isSquareUnderAttack(toRow, toCol, opponentColor, board)
    }
    return true
  }

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

  // Check if king is currently in check
  if (isInCheck(piece.color, board)) {
    return false
  }

  // Check if king would pass through or end up in check
  const kingPath = isKingside ? [5, 6] : [2, 3] // King moves through these squares
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
    san: generateSAN(fromRow, fromCol, toRow, toCol, piece, capturedPiece || undefined, isEnPassant, gameState.board),
    timestamp: Date.now()
  }

  // Handle pawn promotion
  if (piece.type === "pawn" && (toRow === 0 || toRow === 7)) {
    if (promotionPiece) {
      newBoard[toRow][toCol].piece = { type: promotionPiece, color: piece.color, hasMoved: true }
    } else {
      // Set pending promotion instead of auto-promoting to queen
      const newGameState: GameState = {
        ...gameState,
        board: newBoard,
        currentPlayer: gameState.currentPlayer === "white" ? "black" : "white",
        moveHistory: [...gameState.moveHistory, move],
        capturedPieces: newCapturedPieces,
        enPassantTarget: newEnPassantTarget,
        castlingRights: newCastlingRights,
        halfMoveClock: capturedPiece || piece.type === "pawn" ? 0 : gameState.halfMoveClock + 1,
        fullMoveNumber: gameState.currentPlayer === "black" ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber,
        pendingPromotion: { row: toRow, col: toCol, piece: { ...piece, hasMoved: true } },
        positionHistory: [...gameState.positionHistory, boardToFEN({ ...gameState, board: newBoard })]
      }
      return newGameState
    }
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
    fullMoveNumber: gameState.currentPlayer === "black" ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber,
    positionHistory: [...gameState.positionHistory, boardToFEN({ ...gameState, board: newBoard })]
  }

  // Check for check, checkmate, stalemate, or draw
  const opponentColor = gameState.currentPlayer === "white" ? "black" : "white"
  
  // Check for draw conditions first
  if (isFiftyMoveRule(newGameState)) {
    newGameState.gameStatus = "draw"
  } else if (isThreefoldRepetition(newGameState)) {
    newGameState.gameStatus = "draw"
  } else if (hasInsufficientMaterial(newBoard)) {
    newGameState.gameStatus = "draw"
  } else if (isCheckmate(opponentColor, newBoard, newGameState)) {
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
  isEnPassant?: boolean,
  board?: ChessSquare[][]
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
  
  // Handle ambiguous moves (when multiple pieces of the same type can move to the same square)
  let disambiguation = ""
  if (board && piece.type !== "king") {
    const otherPieces = findPiecesOfType(piece.type, piece.color, board)
    const conflictingPieces = otherPieces.filter(({ row, col }) => 
      row !== fromRow && col !== fromCol && 
      isValidMove(row, col, toRow, toCol, piece, board)
    )
    
    if (conflictingPieces.length > 0) {
      // Check if we need file disambiguation
      const sameFile = conflictingPieces.some(({ col }) => col === fromCol)
      if (sameFile) {
        disambiguation = fromFile
      } else {
        // Check if we need rank disambiguation
        const sameRank = conflictingPieces.some(({ row }) => row === fromRow)
        if (sameRank) {
          disambiguation = (8 - fromRow).toString()
        } else {
          disambiguation = fromFile
        }
      }
    }
  }
  
  return `${pieceSymbol}${disambiguation}${capture}${toFile}${toRank}`
}

// Helper function to find all pieces of a specific type and color
const findPiecesOfType = (type: PieceType, color: PieceColor, board: ChessSquare[][]) => {
  const pieces: Array<{row: number, col: number, piece: ChessPiece}> = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece
      if (piece && piece.type === type && piece.color === color) {
        pieces.push({ row, col, piece })
      }
    }
  }
  return pieces
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
    fullMoveNumber,
    pendingPromotion: undefined,
    positionHistory: [fen]
  }
}

// Enhanced function to create game state from backend data
export const createGameStateFromBackend = (gameData: any): GameState => {
  const { current_fen, moves, is_check, is_checkmate, is_stalemate, is_draw } = gameData
  
  // Parse FEN to get board state
  const gameState = FENToBoard(current_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  
  // Update game status based on backend data
  if (is_checkmate) {
    gameState.gameStatus = "checkmate"
  } else if (is_stalemate) {
    gameState.gameStatus = "stalemate"
  } else if (is_draw) {
    gameState.gameStatus = "draw"
  } else if (is_check) {
    gameState.gameStatus = "check"
  } else {
    gameState.gameStatus = "playing"
  }
  
  // Convert backend moves to frontend move format
  if (moves && Array.isArray(moves)) {
    gameState.moveHistory = moves.map((move: any) => ({
      from: { row: 8 - parseInt(move.from[1]), col: move.from.charCodeAt(0) - 97 },
      to: { row: 8 - parseInt(move.to[1]), col: move.to.charCodeAt(0) - 97 },
      piece: { type: move.piece, color: move.turn === 'white' ? 'white' : 'black' },
      san: move.san || `${move.from}-${move.to}`,
      timestamp: new Date(move.timestamp).getTime() || Date.now()
    }))
  }
  
  return gameState
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

// Handle pawn promotion
export const promotePawn = (gameState: GameState, promotionPiece: PieceType): GameState => {
  if (!gameState.pendingPromotion) {
    throw new Error("No pending promotion")
  }

  const { row, col, piece } = gameState.pendingPromotion
  const newBoard = gameState.board.map(row => 
    row.map(square => ({ ...square, piece: square.piece ? { ...square.piece } : null }))
  )

  // Replace pawn with promoted piece
  newBoard[row][col].piece = { 
    type: promotionPiece, 
    color: piece.color, 
    hasMoved: true 
  }

  // Update the last move in history
  const newMoveHistory = [...gameState.moveHistory]
  if (newMoveHistory.length > 0) {
    const lastMove = newMoveHistory[newMoveHistory.length - 1]
    newMoveHistory[newMoveHistory.length - 1] = {
      ...lastMove,
      isPromotion: true,
      promotionPiece: promotionPiece,
      san: lastMove.san + "=" + promotionPiece.toUpperCase()
    }
  }

  return {
    ...gameState,
    board: newBoard,
    pendingPromotion: undefined,
    moveHistory: newMoveHistory
  }
}

// Check if a position has occurred three times (for threefold repetition)
export const isThreefoldRepetition = (gameState: GameState): boolean => {
  const currentFEN = boardToFEN(gameState)
  const positionCount = gameState.positionHistory.filter(fen => fen === currentFEN).length
  return positionCount >= 3
}

// Check for insufficient material (draw)
export const hasInsufficientMaterial = (board: ChessSquare[][]): boolean => {
  const pieces: { [key: string]: number } = {}
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece
      if (piece) {
        const key = `${piece.color}-${piece.type}`
        pieces[key] = (pieces[key] || 0) + 1
      }
    }
  }

  // Count pieces by type
  const whitePieces = Object.keys(pieces).filter(key => key.startsWith('white-')).reduce((sum, key) => sum + pieces[key], 0)
  const blackPieces = Object.keys(pieces).filter(key => key.startsWith('black-')).reduce((sum, key) => sum + pieces[key], 0)
  
  // King vs King
  if (whitePieces === 1 && blackPieces === 1) return true
  
  // King and Bishop vs King
  if ((whitePieces === 2 && pieces['white-bishop'] === 1 && blackPieces === 1) ||
      (blackPieces === 2 && pieces['black-bishop'] === 1 && whitePieces === 1)) return true
  
  // King and Knight vs King
  if ((whitePieces === 2 && pieces['white-knight'] === 1 && blackPieces === 1) ||
      (blackPieces === 2 && pieces['black-knight'] === 1 && whitePieces === 1)) return true
  
  // King and Bishop vs King and Bishop (same color squares)
  if (whitePieces === 2 && blackPieces === 2 && 
      pieces['white-bishop'] === 1 && pieces['black-bishop'] === 1) {
    // Check if bishops are on same color squares
    let whiteBishopSquare = null
    let blackBishopSquare = null
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col].piece
        if (piece?.type === 'bishop') {
          if (piece.color === 'white') whiteBishopSquare = { row, col }
          else blackBishopSquare = { row, col }
        }
      }
    }
    
    if (whiteBishopSquare && blackBishopSquare) {
      const whiteBishopColor = (whiteBishopSquare.row + whiteBishopSquare.col) % 2
      const blackBishopColor = (blackBishopSquare.row + blackBishopSquare.col) % 2
      return whiteBishopColor === blackBishopColor
    }
  }
  
  return false
}

// Check for 50-move rule
export const isFiftyMoveRule = (gameState: GameState): boolean => {
  return gameState.halfMoveClock >= 100 // 50 moves for each player = 100 half-moves
}

// Check if a piece is pinned (would expose king if moved)
const isPiecePinned = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][]
): boolean => {
  // Create a temporary board with the move made
  const tempBoard = board.map(row => 
    row.map(square => ({ ...square, piece: square.piece ? { ...square.piece } : null }))
  )
  
  // Make the move on the temporary board
  tempBoard[toRow][toCol].piece = { ...piece, hasMoved: true }
  tempBoard[fromRow][fromCol].piece = null

  // Find the king's position
  const kingPos = findKingPosition(piece.color, tempBoard)
  
  // Check if the king is under attack after the move
  const opponentColor = piece.color === "white" ? "black" : "white"
  return isSquareUnderAttack(kingPos.row, kingPos.col, opponentColor, tempBoard)
}

// Validate move using backend chess.js engine (if available)
export const validateMoveWithBackend = async (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  gameState: GameState,
  promotionPiece?: PieceType
): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Convert coordinates to algebraic notation
    const files = "abcdefgh"
    const fromSquare = `${files[fromCol]}${8 - fromRow}`
    const toSquare = `${files[toCol]}${8 - toRow}`
    
    const move = {
      from: fromSquare,
      to: toSquare,
      promotion: promotionPiece
    }

    // Send validation request to backend
    const response = await fetch('/api/validate-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen: boardToFEN(gameState),
        move: move
      })
    })

    if (!response.ok) {
      throw new Error('Backend validation failed')
    }

    const result = await response.json()
    return { valid: result.valid, error: result.error }
  } catch (error) {
    // Fallback to frontend validation if backend is unavailable
    console.warn('Backend validation unavailable, using frontend validation:', error)
    const piece = gameState.board[fromRow][fromCol].piece
    if (!piece) return { valid: false, error: 'No piece at source square' }
    
    const valid = isValidMove(fromRow, fromCol, toRow, toCol, piece, gameState.board, gameState)
    return { valid, error: valid ? undefined : 'Invalid move' }
  }
}
