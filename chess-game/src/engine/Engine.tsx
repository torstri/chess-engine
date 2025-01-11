import { Chess, Move } from "chess.js";
import { useState, useMemo } from "react";

enum Turn {
  White = 0,
  Black = 1,
}

// interface PieceInterface {
//   fenNotation: string;
//   representation: number;
//   value: number;
// }

// enum FENPiece {
//   None = 0,
//   P = 1, // "P"
//   N = 2, // "N"
//   B = 3, // "B"
//   R = 4, // "R"
//   Q = 5, // "Q"
//   K = 6, // "K"
//   p = 7, // "p"
//   n = 8, // "n"
//   b = 9, // "b"
//   r = 10, // "r"
//   q = 11, // "q"
//   k = 12, // "k"
// }

class State {
  // possibleMoves: Move[]
  constructor(gameObject: Chess) {}
}

// Node class for representing game states
class Node {
  state: number[];
  turn: Turn;
  depth: number;
  parent: Node | null;
  score: number;
  gameObject: Chess | undefined;
  // Maybe hashmap is better suited
  children: Node[] = [];

  constructor(state: number[], turn: Turn, depth: number, parent: Node | null) {
    this.state = state;
    this.turn = turn;
    this.depth = depth;
    this.parent = parent;
    this.score = 0;
    this.gameObject = undefined;
  }

  // Method to add a child node
  addChild(state: number[], turn: Turn): Node {
    // This might become really weird
    const child = new Node(state, turn, this.depth + 1, this);
    this.children.push(child);
    return child;
  }

  setGameObject(gameObject: Chess) {
    this.gameObject = gameObject;
  }

  // Method to check if this is a leaf node
  isLeaf(): boolean {
    return this.children.length === 0;
  }

  // Method to get the path from this node to the root
  getPathToRoot(): Node[] {
    const path: Node[] = [];
    let current: Node | null = this;
    while (current) {
      path.push(current);
      current = current.parent;
    }
    return path.reverse(); // Reverse to get path from root to current node
  }

  // Utility method to display the node details (for debugging)
  display(): void {
    console.log(`State: ${this.state}`);
    console.log(`Turn: ${this.turn}`);
    console.log(`Depth: ${this.depth}`);
    console.log(`Children count: ${this.children.length}`);
  }
}

// class Piece implements PieceInterface {

// }

export function fenToBoardRepresenation(fen: string): void {
  // reference: https://www.youtube.com/watch?v=FsjIJMUIXLI
  // A1-A8 = 21-28
  // ...
  // H1-H8 = 91-98
  const testFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  console.log("Recieved FEN: ", fen);
  // Step 1: Split the string by spaces to separate the board from the other information
  const fenParts = fen.split(" ");

  // Step 2: Get the board layout (the first part, split by '/')
  const boardLayout = fenParts[0].split("/");

  // Step 3: Extract the other information
  const turn = fenParts[1]; // 'w' or 'b'
  const castlingRights = fenParts[2]; // 'KQkq'
  const enPassant = fenParts[3]; // '-' (no en passant square in this case)
  const halfmoveClock = fenParts[4]; // '0'
  const fullmoveNumber = fenParts[5]; // '1'

  // Output for debugging
  console.log("Board Layout:", boardLayout);
  console.log("Turn:", turn);
  console.log("Castling Rights:", castlingRights);
  console.log("En Passant:", enPassant);
  console.log("Halfmove Clock:", halfmoveClock);
  console.log("Fullmove Number:", fullmoveNumber);

  // Step 4: Iterate over the board layout
  boardLayout.forEach((row, rowIndex) => {
    console.log(`Row ${rowIndex + 1}: ${row}`);
  });
  const boardRepresentation: number[] = new Array(120).fill(0); // Initializes with 0s
}

export function generateMove(): void {}
