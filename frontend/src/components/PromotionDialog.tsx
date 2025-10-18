"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { PieceType, PieceColor, getPieceSymbol } from "@/components/chess-utils"

interface PromotionDialogProps {
  isOpen: boolean
  pieceColor: PieceColor
  onSelect: (piece: PieceType) => void
  onClose: () => void
}

export function PromotionDialog({ isOpen, pieceColor, onSelect, onClose }: PromotionDialogProps) {
  const [selectedPiece, setSelectedPiece] = useState<PieceType | null>(null)

  if (!isOpen) return null

  const promotionPieces: PieceType[] = ["queen", "rook", "bishop", "knight"]

  const handleSelect = (piece: PieceType) => {
    setSelectedPiece(piece)
    onSelect(piece)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-black/90 border-purple-600/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <CardTitle className="text-white text-center mb-4">
            Choose Promotion Piece
          </CardTitle>
          <div className="grid grid-cols-2 gap-4">
            {promotionPieces.map((piece) => (
              <Button
                key={piece}
                variant="outline"
                className={`
                  aspect-square text-4xl p-4 border-2 transition-all duration-200
                  ${selectedPiece === piece 
                    ? "border-purple-500 bg-purple-600/20" 
                    : "border-gray-600 hover:border-purple-400 hover:bg-purple-600/10"
                  }
                `}
                onClick={() => handleSelect(piece)}
              >
                <span className={pieceColor === "white" ? "text-white" : "text-black"}>
                  {getPieceSymbol({ type: piece, color: pieceColor })}
                </span>
              </Button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-600/10"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
