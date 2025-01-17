import { Chess, Move } from "chess.js";
import { pieceValue } from "./chessAI";
import { getAttackedPiece } from "./chessAI";

enum stateBias {
  attacked = 0.1,
  inCheck = 0.5,
}

export class State {
  fen: string;
  totalScore: number = 0;

  constructor(fen: string, score?: number) {
    this.fen = fen;
    this.totalScore = score ? score : 0;
  }

  addStateScoreBias(game: Chess, move: Move, player: string): number {
    let score = 0;

    if (game.isCheck())
      score += move.color == player ? stateBias.inCheck : -stateBias.inCheck;

    // if(game.isAttacked(move.to, move.color)) {
    //   const attackedPiece = getAttackedPiece(game, move) ?? '';
    //   const pv = pieceValue[attackedPiece];
    //   score += move.color != player ? stateBias.attacked*pv : -stateBias.attacked*pv;
    // }

    if (move.captured)
      score +=
        move.color == player
          ? pieceValue[move.captured] / pieceValue["q"]
          : -(pieceValue[move.captured] / pieceValue["q"]);

    return score;
  }

  addScore(score: number): void {
    this.totalScore += score;
  }

  possibleMoves(): Move[] {
    return new Chess(this.fen).moves({ verbose: true });
  }

  getGameObj(): Chess {
    return new Chess(this.fen);
  }

  isGameOver(): boolean {
    return new Chess(this.fen).isGameOver();
  }
}
