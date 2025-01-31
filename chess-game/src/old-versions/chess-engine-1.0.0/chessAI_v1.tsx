import { Chess, Move } from "chess.js";
import { Node } from "./Node";
import { State } from "./State";

// Constants
const C = 2;
const MAXDEPTH = 3;
const pieceValue = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

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

export class chessAI_v1 {
  player: string;
  root: Node | undefined;
  maxDuration: number = 200;

  constructor(game: Chess, player: string, maxDuration: number) {
    this.player = player;
    this.root = new Node(new State(game.fen()), player, 0);
    this.root.nodeExpansion();
    console.log(
      "Hello world! VERSION 1 PLAYING AS: ",
      this.player === "w" ? " WHITE!" : " BLACK!"
    );
    this.maxDuration = maxDuration;
  }

  // Monte Carlo Tree Search
  makeMove(game: Chess): Move {
    // console.log(
    //   "VERSION 1 PLAYING AS",
    //   this.player === "w" ? " WHITE!" : " BLACK!",
    //   " with max duration =",
    //   this.maxDuration
    // );
    this.root = new Node(new State(game.fen()), this.player, 0);
    // console.log("VERSION 1 THINKING");
    const startTime = Date.now();
    const duration = this.maxDuration;
    let current: Node = this.root;
    current.visits++;

    while (Date.now() - startTime < duration) {
      // Tree traversal phase
      if (!current.isLeaf()) {
        let maxUSB = -Infinity;
        let selectedChild: Node | undefined;

        current.children.forEach((child: Node) => {
          const ucb = this.ucb1(
            child.state.totalScore,
            current.visits,
            child.visits
          );
          if (ucb > maxUSB) {
            selectedChild = child;
            maxUSB = ucb;
          }
        });

        if (selectedChild) {
          current = selectedChild;
        } else {
          throw new Error("No child found");
        }
      } else if (current.visits > 0) {
        // Node expansion phase
        current.nodeExpansion();
      } else {
        // Rollout
        this.propogate(current, this.rollout(new Chess(current.state.fen)));

        current = this.root;
      }
    }

    return this.getOptimalMove(this.root);
  }

  getOptimalMove(root: Node): Move {
    let move: Move | undefined = undefined;
    let maxScore = -Infinity;
    root.children.forEach((child: Node) => {
      if (child.state.totalScore > maxScore) {
        move = child.move;
        maxScore = child.state.totalScore;
      }
    });

    if (!move) throw new Error("No move found");

    return move;
  }

  propogate(leaf: Node, score: number): void {
    const path = leaf.getPathToRoot();
    path.forEach((node: Node) => {
      node.state.totalScore += score;
      node.visits++;
    });
  }

  rollout(game: Chess): number {
    if (game.isGameOver()) return this.evaluateState(game, this.player);

    const randomIndex = Math.floor(Math.random() * game.moves().length);
    const randomMove = game.moves()[randomIndex];

    try {
      game.move(randomMove);
    } catch (e) {
      console.error("MOVE: ", randomMove);
      throw new Error("INVALID MOVE");
    }

    return this.rollout(game);
  }

  ucb1(score: number, N: number, n: number): number {
    // ucb: average value of state + constant * sqrt(ln(times visited parent) / number of visits of this node)
    // constant choosen to balance the explotation term and the exploration term
    // explotation term: V_i (average value of state)
    // exploration term: n_i, number of visits of this node

    if (n == 0 || N == 0) return Infinity;

    return score / n + C * Math.sqrt(Math.log(N) / n);
  }

  evaluateState(game: Chess, player: string): number {
    // const scoreWhite = getTotalPiecesOnBoard(game, Turn.White);
    // const scoreBlack = getTotalPiecesOnBoard(game, Turn.Black);

    // const diff = (scoreBlack - scoreWhite);
    let win;

    if (game.isCheckmate()) {
      win = game.turn() == player ? -1 : 1;
    } else {
      win = -0.2;
    }

    return win;
  }

  getTotalPiecesOnBoard(game: Chess, color?: string): number {
    let score = 0;
    game.board().forEach((row, rowIdx) => {
      row.forEach((square, colIdx) => {
        if ((color && square && square.color === color) || (!color && square)) {
          score += pieceValue[square.type];
        }
      });
    });

    return score;
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
}
