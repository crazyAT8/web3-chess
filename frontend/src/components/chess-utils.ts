export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
export type PieceColor = "white" | "black"

export interface ChessPiece {
  type: PieceType
  color: PieceColor
}

export interface ChessSquare {
  piece: ChessPiece | null
  isSelected: boolean
  isValidMove: boolean
  isInCheck: boolean
}

export interface GameState {
  board: ChessSquare[][]
  currentPlayer: PieceColor
  gameStatus: "playing" | "check" | "checkmate" | "stalemate" | "draw"
  moveHistory: string[]
  capturedPieces: { white: ChessPiece[]; black: ChessPiece[] }
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
    board[0][col].piece = { type, color: "black" }
  })
  for (let col = 0; col < 8; col++) {
    board[1][col].piece = { type: "pawn", color: "black" }
  }

  // Place white pieces
  const whitePieces: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
  whitePieces.forEach((type, col) => {
    board[7][col].piece = { type, color: "white" }
  })
  for (let col = 0; col < 8; col++) {
    board[6][col].piece = { type: "pawn", color: "white" }
  }

  return board
}

export const isValidMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece,
  board: ChessSquare[][],
): boolean => {
  // Basic bounds checking
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false

  const targetPiece = board[toRow][toCol].piece
  if (targetPiece && targetPiece.color === piece.color) return false

  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  switch (piece.type) {
    case "pawn":
      const direction = piece.color === "white" ? -1 : 1
      const startRow = piece.color === "white" ? 6 : 1

      if (colDiff === 0) {
        // Forward move
        if (toRow === fromRow + direction && !targetPiece) return true
        if (fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) return true
      } else if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
        // Diagonal capture
        return true
      }
      return false

    case "rook":
      if (rowDiff === 0 || colDiff === 0) {
        return isPathClear(fromRow, fromCol, toRow, toCol, board)
      }
      return false

    case "bishop":
      if (rowDiff === colDiff) {
        return isPathClear(fromRow, fromCol, toRow, toCol, board)
      }
      return false

    case "queen":
      if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
        return isPathClear(fromRow, fromCol, toRow, toCol, board)
      }
      return false

    case "king":
      return rowDiff <= 1 && colDiff <= 1

    case "knight":
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)

    default:
      return false
  }
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
