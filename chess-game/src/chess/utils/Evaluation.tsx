import { Chess, Move, PieceSymbol } from "chess.js";
import { stateBias } from "./Types";
import { pieceValue } from "./Constants";
import { PSQT, getSquareInTable } from "./PSQT";

export function evaluateTerminalState(game: Chess, player: String): number {
    let win;

    if (game.isCheckmate()) {
      win = game.turn() == player ? -stateBias.checkMate : stateBias.checkMate;
    } else {
      win = stateBias.draw;
    }

    return win;
  }

  export function sumPieceSquareEvaluation(game: Chess, player: string): number {
    let score = 0;
    game.board().forEach((row, rowIdx) => {
      row.forEach((square, colIdx) => {
        if (square) { 

          if(square.color == player) 
            score += pieceSquareEvaluation(rowIdx, colIdx, square.type);
          // else
          //   score -= pieceSquareEvaluation(rowIdx, colIdx, square.type);

        }
      });
    });

    return score;
  }

  export function pieceSquareEvaluation(rowIdx: number, colIdx: number, piece: PieceSymbol): number {

    const PSQT_MAP: { [key in PieceSymbol]?: number[][] } = {
      p: PSQT.PAWN,   
      b: PSQT.BISHOP, 
      n: PSQT.KNIGHT, 
      r: PSQT.ROOK,   
      q: PSQT.QUEEN,  
    };
  
    return PSQT_MAP[piece] ? PSQT_MAP[piece][rowIdx][colIdx] : 0;
  }

  export function evaluateState(game: Chess, player: string, move: Move): number {
    let score = 0;

    if (game.isCheck())
      score += move.color == player ? stateBias.inCheck : -stateBias.inCheck;

    if (move.san.includes('O-O') || move.san.includes('O-O-O')) 
      score += move.color == player ? stateBias.castled : -stateBias.castled;

    if (move.captured)
      score +=
        move.color == player
          ? pieceValue[move.captured] * 10
          : -10 * (pieceValue[move.captured]);

    if (move.color == player) {
      const square = getSquareInTable(move);
      score += pieceSquareEvaluation(square.rowIdx, square.colIdx, move.piece);
    }

    return score;
  }