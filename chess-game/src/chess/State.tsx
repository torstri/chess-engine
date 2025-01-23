import { Chess, Move } from "chess.js";

export class State {
  fen: string;
  totalScore: number = 0;

  constructor(fen: string, score?: number) {
    this.fen = fen;
    this.totalScore = score ? score : 0;
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
