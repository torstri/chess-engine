import { Chess, Move } from "chess.js";
import { pieceValue } from "./chessAI_v2";

enum stateBias {
  castled = 0.5,
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

    if (move.san.includes("O-O") || move.san.includes("O-O-O"))
      score += move.color == player ? stateBias.castled : -stateBias.castled;

    if (move.captured)
      score +=
        move.color == player
          ? pieceValue[move.captured] / pieceValue["q"]
          : -(pieceValue[move.captured] / pieceValue["q"]);

    return score;
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
