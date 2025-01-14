import { Chess, Move } from "chess.js";

export class State {
    fen: string;
    totalScore: number = 0;
  
    constructor(fen: string) {
      this.fen = fen;
    }
  
    addScore(score: number): void {
      this.totalScore += score;
    }
  
    possibleMoves(): string[] {
      return new Chess(this.fen).moves();
    }
  
    getGameObj(): Chess {
      return new Chess(this.fen);
    }
  
    isGameOver(): boolean {
      return new Chess(this.fen).isGameOver();
    }
  
  }