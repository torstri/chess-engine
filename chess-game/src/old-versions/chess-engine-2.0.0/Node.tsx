import { Chess, Move } from "chess.js";
import { State } from "./State";

// Node class for representing game states
export class Node {
    static player: string;
  
    state: State;
    turn: string;
    depth: number;
    parent: Node | undefined;
    move: Move | undefined;
    visits: number;
    children: Node[] = [];
  
    constructor(state: State, turn: string, depth: number, parent?: Node, move?: Move) {
      this.state = state;
      this.turn = turn;
      this.depth = depth;
      this.parent = parent;
      this.move = move;
      this.visits = 0;
    }
  
    static setPlayer(player: string): void {
      Node.player = player;
    }
  
    static getPlayer(): string {
      return Node.player;
    }
  
    numMoves(): number {
      return this.state.possibleMoves.length;
    }
  
    moves(): Move[] {
      return this.state.possibleMoves();
    }
  
    nodeExpansion() {
      this.state.possibleMoves().forEach((move: Move) => {
        const gameCopy = new Chess(this.state.fen);
        gameCopy.move(move);
        this.addChild(
          new State(gameCopy.fen()),
          gameCopy,
          gameCopy.turn(),
          move
        );
      });
    }
  
    addChild(state: State, game: Chess, turn: string, move: Move): Node {
      state.totalScore += state.addStateScoreBias(game, move, Node.getPlayer());
      const child = new Node(state, turn, this.depth + 1, this, move);
      this.children.push(child);
      return child;
    }
  
    isLeaf(): boolean {
      return this.children.length === 0;
    }
  
    getPathToRoot(): Node[] {
      const path: Node[] = [];
      let current: Node | undefined = this;
      while (current) {
        path.push(current);
        current = current.parent;
      }
      return path.reverse();
    }

    addScore(score: number): void {
      this.state.totalScore += score;
    }
  
    // Utility method to display the node details (for debugging)
    display(): void {
      console.log(`State: ${this.state}`);
      console.log(`Turn: ${this.turn}`);
      console.log(`Depth: ${this.depth}`);
      console.log(`Children count: ${this.children.length}`);
      console.log(`Score: ${this.state.totalScore}`)
    }
  }