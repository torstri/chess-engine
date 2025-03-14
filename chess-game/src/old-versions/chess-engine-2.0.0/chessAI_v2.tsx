import { Chess, Move, PieceSymbol } from "chess.js";
import { Node } from "./Node";
import { State } from "./State";

enum Player {
  White = "w",
  Black = "b",
}

// Constants
const C = 2;
const MAXDEPTH = 3;
const duration = 100;
const totPieceValue = 39;
export const pieceValue = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 99,
  "": 0,
};

export class chessAI_v2 {
  player: string;
  root: Node | undefined;
  maxDuration: number = 200;

  constructor(game: Chess, player: string, maxDuration: number) {
    this.player = player;
    this.root = new Node(new State(game.fen()), player, 0);
    this.root.nodeExpansion();
    this.maxDuration = maxDuration;
    console.log(
      "Hello world! VERSION 2 PLAYING AS: ",
      this.player === "w" ? " WHITE!" : " BLACK!",
      " with max duration: ",
      this.maxDuration
    );
  }

  // Monte Carlo Tree Search
  makeMove(game: Chess): Move {
    this.root = new Node(new State(game.fen()), Node.getPlayer(), 0);

    // console.log("Thinking...");

    const startTime = Date.now();
    let current: Node = this.root;

    while (Date.now() - startTime < this.maxDuration) {
      // Tree traversal phase
      if (!current.isLeaf()) {
        current = this.getMaxUCBnode(current);
      } else if (current.visits > 0) {
        // Node expansion phase
        current.nodeExpansion();
      } else {
        // Rollout
        this.propogate(current, this.rollout(new Chess(current.state.fen), 0));

        current = this.root;
      }
    }

    return this.getBestMove(this.root);
  }

  getBestMove(root: Node): Move {
    let move: Move | undefined;
    let maxScore = -Infinity;

    root.children.forEach((ch: Node) => {
      if (ch.state.totalScore > maxScore) {
        move = ch.move;
        maxScore = ch.state.totalScore;
      }
    });

    if (!move) throw new Error("No move found");

    // console.log("MAX SCORE", maxScore);

    return move;
  }

  getMaxUCBnode(node: Node): Node {
    let maxUSB = -Infinity;
    let selectedChild: Node | undefined;

    node.children.forEach((child: Node) => {
      const ucb = this.ucb1(child.state.totalScore, node.visits, child.visits);
      if (ucb > maxUSB) {
        selectedChild = child;
        maxUSB = ucb;
      }
    });

    if (selectedChild) {
      node = selectedChild;
    } else {
      throw new Error("No child found");
    }

    return node;
  }

  propogate(current: Node, score: number): void {
    current.addScore(score);
    current.visits++;
    while (current.parent) {
      current = current.parent;
      current.addScore(score);
      current.visits++;
    }
  }

  rollout(game: Chess, depth: number): number {
    if (game.isGameOver()) return this.evaluateState(game);

    if (depth > MAXDEPTH) {
      const wSum = this.getSumPieceValue(game, Player.White);
      const bSum = this.getSumPieceValue(game, Player.Black);
      return (wSum - bSum) / totPieceValue;
    }

    const randomIndex = Math.floor(Math.random() * game.moves().length);
    const randomMove = game.moves()[randomIndex];

    try {
      game.move(randomMove);
    } catch (e) {
      console.error("MOVE: ", randomMove);
      throw new Error("INVALID MOVE");
    }

    return this.rollout(game, depth + 1);
  }

  ucb1(score: number, N: number, n: number): number {
    // ucb: average value of state + constant * sqrt(ln(times visited parent) / number of visits of this node)
    // constant choosen to balance the explotation term and the exploration term
    // explotation term: V_i (average value of state)
    // exploration term: n_i, number of visits of this node

    if (n == 0 || N == 0) return Infinity;

    return score / n + C * Math.sqrt(Math.log(N) / n);
  }

  evaluateState(game: Chess): number {
    // const scoreWhite = getSumPieceValue(game, Turn.White);
    // const scoreBlack = getSumPieceValue(game, Turn.Black);

    // const diff = (scoreBlack - scoreWhite);
    let win;

    if (game.isCheckmate()) {
      win = game.turn() == Node.getPlayer() ? -2 : 2;
    } else {
      win = 1;
    }

    return win;
  }

  getSumPieceValue(game: Chess, color?: string): number {
    let score = 0;
    game.board().forEach((row) => {
      row.forEach((square) => {
        if ((color && square && square.color === color) || (!color && square)) {
          score += pieceValue[square.type];
        }
      });
    });

    return score;
  }

  getAttackedPiece(game: Chess, move: Move): PieceSymbol | undefined {
    if (game.isAttacked(move.to, game.turn())) {
      const board = game.board();
      const fileIndex = move.to.charCodeAt(0) - "a".charCodeAt(0);
      const rankIndex = 8 - parseInt(move.to[1]);
      const piece = board[rankIndex][fileIndex];

      return piece?.type;
    }

    return undefined;
  }

  fenToBoardRepresenation(fen: string): void {
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

    const game = new Chess(fen);

    // Output for debugging
    console.log("Board Layout:", boardLayout);
    console.log("Turn:", turn);
    console.log("Castling Rights:", castlingRights);
    console.log("En Passant:", enPassant);
    console.log("Halfmove Clock:", halfmoveClock);
    console.log("Fullmove Number:", fullmoveNumber);
    console.log(game.ascii());

    // Step 4: Iterate over the board layout
    boardLayout.forEach((row, rowIndex) => {
      console.log(`Row ${rowIndex + 1}: ${row}`);
    });
    const boardRepresentation: number[] = new Array(120).fill(0); // Initializes with 0s
  }

  generateMove(): void {}
}
