import { Chess, Move, Color } from "chess.js";
import { State } from "./State";
import { evaluateState } from "./utils/Evaluation";

// Node class for representing game states
export class Node {
  state: State;
  turn: string;
  depth: number;
  parent: Node | undefined | null;
  move: Move | undefined;
  visits: number;
  children: Node[] = [];
  totalScore: number = 0;

  constructor(
    state: State,
    turn: string,
    depth: number,
    parent?: Node,
    move?: Move
  ) {
    this.state = state;
    this.turn = turn;
    this.depth = depth;
    this.parent = parent;
    this.move = move;
    this.visits = 0;
  }

  numMoves(): number {
    return this.state.possibleMoves.length;
  }

  moves(): Move[] {
    return this.state.possibleMoves();
  }

  isTerminal(): boolean {
    return this.state.isGameOver();
  }

  nodeExpansion(player: Color) {
    this.state.possibleMoves().forEach((move: Move) => {
      const gameCopy = new Chess(this.state.fen);
      gameCopy.move(move);
      this.addChild(
        new State(gameCopy.fen(), evaluateState(gameCopy, player)),
        gameCopy.turn(),
        move
      );
    });
  }

  addChild(state: State, turn: string, move: Move): Node {
    const child = new Node(state, turn, this.depth + 1, this, move);
    this.children.push(child);
    return child;
  }

  addChildByNode(child: Node) {
    this.children.push(child);
    return child;
  }

  isLeaf(): boolean {
    return this.children.length === 0;
  }

  getPathToRoot(): Node[] {
    const path: Node[] = [];
    let current: Node | undefined | null = this;
    while (current) {
      path.push(current);
      current = current.parent;
    }
    return path.reverse();
  }

  addScore(score: number): void {
    this.state.totalScore += score;
    this.totalScore += score;
  }

  clearTree() {
    let nodeNumber = 0;
    for (const child of this.children) {
      nodeNumber += child.clearTree(); // Recursively delete child nodes
    }
    this.children = []; // Remove all child references
    this.parent = null; // Break parent references
    nodeNumber++;
    return nodeNumber;
  }

  // Utility method to display the node details (for debugging)
  display(): void {
    console.log(`State: ${this.state}`);
    console.log(`Turn: ${this.turn}`);
    console.log(`Depth: ${this.depth}`);
    console.log(`Children count: ${this.children.length}`);
    console.log(`Score: ${this.state.totalScore}`);
  }
}
