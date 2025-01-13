import { Chess, Move } from "chess.js";

enum Turn {
  White = 'w',
  Black = 'b',
}

// Constants
const C = 2;
const MAXDEPTH = 100;
const pieceValue = { 
  'p': 1,
  'n': 3,
  'b': 3,
  'r': 5,
  'q': 9,
  'k': 0,
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

export class State {
  game: Chess;
  possibleMoves: string[];
  totalScore: number;
  constructor(gameObject: Chess) {
    this.game = gameObject;
    this.possibleMoves = gameObject.moves() ?? [];
    this.totalScore = 0;
  }

  addScore(score: number): void {
    this.totalScore += score;
  }

}

// Node class for representing game states
export class Node {
  static player: string;

  state: State;
  turn: string;
  depth: number;
  parent: Node | undefined;
  move: string | undefined;
  visits: number;
  // Maybe hashmap is better suited
  children: Node[] = [];

  constructor(state: State, turn: string, depth: number, parent?: Node, move?: string) {
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

  getPlayer(): string {
    return Node.player;
  }

  numMoves(): number {
    return this.state.possibleMoves.length;
  }

  moves(): string[] {
    return this.state.possibleMoves;
  }

  visited(): void { this.visits++; }

  nodeExpansion() {
    this.state.possibleMoves.forEach((move: string) => {
      const gameCopy = new Chess(this.state.game.fen());
      gameCopy.move(move);
      this.addChild(
        new State(gameCopy),    // TODO: init new state
        gameCopy.turn(),
        move
      )
    });
  }

  addChild(state: State, turn: string, move: string): Node {
    // This might become really weird
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

  // Utility method to display the node details (for debugging)
  display(): void {
    console.log(`State: ${this.state}`);
    console.log(`Turn: ${this.turn}`);
    console.log(`Depth: ${this.depth}`);
    console.log(`Children count: ${this.children.length}`);
    console.log(`Score: ${this.state.totalScore}`)
  }
}

export function mcts(root: Node): string | undefined {

  console.log("Thinking..");

  const startTime = Date.now(); 
  const duration = 2000;
  let current: Node = root;
  current.visited();

  while (Date.now() - startTime < duration) {
    // Tree traversal phase
    if (!current.isLeaf()) {
      let maxUSB = -Infinity;
      let selectedChild: Node | undefined;

      current.children.forEach((child: Node) => {
        const ucb = ucb1(child.state.totalScore, current.visits, child.visits);
        if (ucb > maxUSB) {
          selectedChild = child;
          maxUSB = ucb;
        }
      });

      if (selectedChild) {
        current = selectedChild;
        console.log(current.depth);
      } else {
        throw new Error("No child found");
      }

    } else {
      if (current.visits > 0) {
        // Node expansion phase
        current.nodeExpansion();
      }
      // Rollout
      propogate(current, rollout(current));
      current = root;

    }
  }

  return getOptimalMove(root);
}


function getOptimalMove(root: Node): string | undefined {
  let move: string | undefined = undefined;
  let maxScore = -Infinity;
  root.children.forEach((child: Node) => {
    if((child.state.totalScore / Math.max(1, child.visits)) > maxScore) {
      move = child.move;
      maxScore = child.state.totalScore / child.visits;
    } 
  })

  return move;
}

function propogate(leaf: Node, score: number): void {
  const path = leaf.getPathToRoot();
  path.forEach((node: Node) => {
    node.state.addScore(score);
    node.visited();
  });
}

function rollout(node: Node): number {
  if(node.state.game.isGameOver() || node.numMoves() == 0) return evaluateState(node.state, node.getPlayer());

  const randomIndex = Math.floor(Math.random() * node.state.possibleMoves.length); 
  const gameCopy = new Chess(node.state.game.fen());
  const randomMove = gameCopy.moves()[randomIndex];
  try {
    gameCopy.move(randomMove);
  } catch(e) {
    console.error("MOVE: ", randomMove);
    throw new Error("INVALID MOVE");
  }
  
  // fenToBoardRepresenation(gameCopy.fen());

  const child: Node = new Node(
    new State(gameCopy),
    gameCopy.turn(),
    node.depth + 1,
    node,
    randomMove
  )

  return rollout(child);
}

function ucb1(score: number, N: number, n: number): number {
  // ucb: average value of state + constant * sqrt(ln(times visited parent) / number of visits of this node)
  // constant choosen to balance the explotation term and the exploration term
  // explotation term: V_i (average value of state)
  // exploration term: n_i, number of visits of this node 

  if(n == 0 || N == 0) return Infinity;

  return (score / n) + C * Math.sqrt(Math.log(N) / n);
}

function evaluateState(state: State, player: string): number {
  const scoreWhite = getTotalPiecesOnBoard(state.game, Turn.White);  
  const scoreBlack = getTotalPiecesOnBoard(state.game, Turn.Black);

  const diff = (scoreBlack - scoreWhite);
  let win;

  if(state.game.isCheckmate()) {
    win = state.game.turn() == player ? -1 : 1;
  } else {
    win = -0.2;
  }

  return win;
}

function getTotalPiecesOnBoard(game: Chess, color?: string): number {
  let score = 0;
  game.board().forEach((row, rowIdx) => {
    row.forEach((square, colIdx) => {
      if((color && square && square.color === color) || (!color && square)) {
        score += pieceValue[square.type];
      }
    })
  })
  // console.log("score", score);
  return score;
}

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

export function generateMove(): void {}
