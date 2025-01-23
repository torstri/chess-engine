import { Chess, Move, PieceSymbol } from "chess.js";
import { Node } from "./Node";
import { State } from "./State";

enum Player {
  White = "w",
  Black = "b",
}

// Constants
const C = 2;
const MAX_DEPTH = 3;
const ALLOWED_DURATION = 300;
const TOTAL_PIECE_VALUE = 39;

// Statistics
let selectionCount = 0;
let rolloutCount = 0;
let expansionCount = 0;
let selectionTime = 0;
let rolloutTime = 0;
let expansionTime = 0;

export const pieceValue = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 99,
  "": 0,
};

export class ChessAI {
  player: string;
  root: Node | undefined;

  constructor(game: Chess, player: string) {
    this.player = player;
    this.root = new Node(new State(game.fen()), player, 0);
    this.root.nodeExpansion();
  }

  // Monte Carlo Tree Search
  makeMove(game: Chess): Move {
    this.root = new Node(new State(game.fen()), Node.getPlayer(), 0);

    // console.log("Thinking...");

    const startTime = Date.now();
    let tempTime = startTime;
    let current: Node = this.root;
    let evaluation = -10;
    while (Date.now() - startTime < ALLOWED_DURATION) {
      // Tree traversal phase
      if (!current.isLeaf()) {
        current = this.getMaxUCBnode(current);
      } else if (current.visits > 0) {
        // Node expansion phase
        tempTime = Date.now();
        current.nodeExpansion();
        expansionTime += Date.now() - tempTime;

        expansionCount++;
      } else {
        // Rollout
        tempTime = Date.now();
        this.propogate(current, this.rollout(new Chess(current.state.fen), 0));
        rolloutTime += Date.now() - tempTime;
        rolloutCount++;

        current = this.root;
      }
    }

    // console.log("Evaluation: ", this.root.state.totalScore);
    console.log(
      "Rollouts: ",
      rolloutCount,
      ". Average time spent on rollouts: ",
      rolloutTime / rolloutCount
    );
    console.log(
      "Expansions: ",
      expansionCount,
      ". Average time spent on expansions: ",
      expansionTime / expansionCount
    );
    this.consoleLogs(game, this.player);
    rolloutCount = 0;
    expansionCount = 0;
    rolloutTime = 0;
    expansionTime = 0;

    return this.getBestMove(this.root);
  }

  getBestMove(root: Node): Move {
    console.log("------------ New Move --------------");

    let move: Move | undefined;
    let maxScore = -Infinity;
    let bestChild: Node | undefined;
    root.children.forEach((ch: Node) => {
      if (ch.state.totalScore > maxScore) {
        move = ch.move;
        maxScore = ch.state.totalScore;
        bestChild = ch;
      }
    });

    if (!move) throw new Error("No move found");

    const visits = this.root?.visits;
    const score = this.root?.state.totalScore;
    if (visits && score) {
      console.log("Best move found: ", move);
      console.log(
        "With evaluated position : ",
        score,
        " and mean: ",
        score / visits
      );
    }
    if (this.root?.state?.totalScore && this.root?.visits) {
      console.log(
        "Evaluation of given position: ",
        this.root?.state?.totalScore / this.root?.visits
      );
    }

    console.log("-------------- End Move --------------");

    return move;
  }

  consoleLogs(game: Chess, color: string) {
    const whiteMobility = this.evaluateMobility(game, Player.White);
    const blackMobility = this.evaluateMobility(game, Player.Black);

    // Normalize
    const mobilityScore =
      color === Player.White
        ? whiteMobility - blackMobility
        : blackMobility - whiteMobility;

    const whiteMaterial = this.evaluateMaterial(game, Player.White);
    const blackMaterial = this.evaluateMaterial(game, Player.Black);

    const materialScore =
      color === Player.White
        ? whiteMaterial - blackMaterial
        : blackMaterial - whiteMaterial;

    const whiteThreats = this.evaluateThreats(game, Player.White);
    const blackThreats = this.evaluateThreats(game, Player.Black);
    const alternatvetTthreatEvaluation =
      color === Player.White
        ? blackThreats - whiteThreats
        : whiteThreats - blackThreats;
    const threatEvaluation = this.evaluateThreats(game, color);
    console.log("Mobility Score: ", 0.1 * mobilityScore);
    console.log("Material Score: ", materialScore);
    console.log("Threat Score: ", -threatEvaluation);
    console.log("Alt Threat Score: ", alternatvetTthreatEvaluation);
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
    let tempGame = game;
    if (tempGame.isGameOver()) {
      return this.evaluateTerminalState(tempGame);
    }

    if (depth > MAX_DEPTH) {
      // const wSum = this.evaluateMaterial(tempGame, Player.White);
      // const bSum = this.evaluateMaterial(tempGame, Player.Black);
      return this.evaluation(tempGame, tempGame.turn());
    }

    const randomIndex = Math.floor(Math.random() * tempGame.moves().length);
    const randomMove = tempGame.moves()[randomIndex];

    try {
      tempGame.move(randomMove);
    } catch (e) {
      console.error("MOVE: ", randomMove);
      throw new Error("INVALID MOVE");
    }

    return this.rollout(tempGame, depth + 1);
  }

  ucb1(score: number, N: number, n: number): number {
    // ucb: average value of state + constant * sqrt(ln(times visited parent) / number of visits of this node)
    // constant choosen to balance the explotation term and the exploration term
    // explotation term: V_i (average value of state)
    // exploration term: n_i, number of visits of this node

    if (n == 0 || N == 0) return Infinity;

    return score / n + C * Math.sqrt(Math.log(N) / n);
  }

  // Returns draw ? 0 : loss ? -5 : 5
  evaluateTerminalState(game: Chess): number {
    // A terminal state is either checkmate or a draw
    let win = 0;
    if (game.isCheckmate()) {
      console.log(
        "Found CHECKMATE state against: ",
        game.turn(),
        " evaluated to: ",
        game.turn() == this.player ? -1000 : 1000
      );

      // Should this not be this.root.getPlayer()
      return game.turn() == this.player ? -1000 : 1000;
    }
    console.log("Found DRAW");

    return win;
  }

  evaluation(game: Chess, color: string): number {
    const whiteMobility = this.evaluateMobility(game, Player.White);
    const blackMobility = this.evaluateMobility(game, Player.Black);

    // Normalize
    const mobilityScore =
      color === Player.White
        ? whiteMobility - blackMobility
        : blackMobility - whiteMobility;

    const whiteMaterial = this.evaluateMaterial(game, Player.White);
    const blackMaterial = this.evaluateMaterial(game, Player.Black);

    const materialScore =
      color === Player.White
        ? whiteMaterial - blackMaterial
        : blackMaterial - whiteMaterial;

    const whiteThreats = this.evaluateThreats(game, Player.White);
    const blackThreats = this.evaluateThreats(game, Player.Black);
    const threatEvaluation =
      color === Player.White
        ? blackThreats - whiteThreats
        : whiteThreats - blackThreats;
    // const threatEvaluation = this.evaluateThreats(game, color);

    // console.log(
    //   "Mobility Score: ",
    //   mobilityScore,
    //   " Material Score: ",
    //   materialScore,
    //   "Threat Evaluation: ",
    //   threatEvaluation
    // );
    return 0.1 * mobilityScore + 2 * materialScore + threatEvaluation;
  }

  // Right now this probably favours aggressive players
  // Returns number of squares we defend + number of squares we attack
  evaluateMobility(game: Chess, color: string): number {
    // To evaluate mobility we consider two things:
    // 1. Squares we attack and 2. squares we defend

    // 1. Squares we attack we can find through game.moves ezpz
    // 2. Squares we defend is trickier so we iterate over all squares
    // If we are attacking the square, but it is not included in game.moves()
    // -> we are occupying it i.e. we are defending it

    // Lastly, game.moves() only works if param color is the one to move
    // so we change the game if we are not the one to move

    // Map to store all squares we are attacking
    const attackedSquaresMap: { [key: string]: number } = {};

    let attackedSquares = 0; // Keeps track of our legal moves

    // If the passed color is not the one to move we need to change the game
    // in order to utilize game.move()
    if (game.turn() !== this.player) {
      // FEN: "row/row/row/row/row/row/row/row ActiveColor CastlingRights EnPassantTargetSquare Half-MoveClock Full-MoveClock"
      let gameFen = game.fen();
      let fenParts = gameFen.split(" ");

      // Switch turn in the FEN (index 1 contains turn)
      fenParts[1] = color; // Set the turn to the desired color

      // Construct new FEN
      let newFen = fenParts.join(" ");

      // Create a new instance of the game to avoid mutating the original
      let newGame = new Chess();

      try {
        newGame.load(newFen);
      } catch (error) {
        newGame = game;
        const randomIndex = Math.floor(Math.random() * game.moves().length);
        const randomMove = newGame.moves()[randomIndex];
        newGame.move(randomMove);
      }
      // We check all of the moves possible
      // We use verbose since this returns
      // piece, from and to, and we want to see which square we are attacking
      newGame.moves({ verbose: true }).forEach((move) => {
        attackedSquaresMap[move.to] = attackedSquaresMap[move.to]
          ? 1
          : attackedSquaresMap[move.to] + 1;
        attackedSquares++;
      });
    } else {
      game.moves({ verbose: true }).forEach((move) => {
        attackedSquaresMap[move.to] = attackedSquaresMap[move.to]
          ? 1
          : attackedSquaresMap[move.to] + 1;
        attackedSquares++;
      });
    }
    // THIS MIGHT BE INCORRECT:
    // game.isAttacked(square, color) returns true even if we are pinned
    // if we are pinned then it will not be a legal move
    // this could be checked with a try catch block
    // since game.move(pinned_piece) will throw an exception

    // Iterate over all squares
    // If we are attacking a square but it is not one of our legal moves,
    // then we are defending the piece
    // Sum these up
    let defendedSquares = 0;
    game.board().forEach((row) => {
      row.forEach((square) => {
        if (square?.square && color === square.color) {
          if (!attackedSquaresMap[square.square]) {
            // I do not know if we can do like this
            defendedSquares += game.isAttacked(square.square, square.color)
              ? 1 * pieceValue[square.type]
              : 0;
          }
        }
      });
    });

    return defendedSquares + attackedSquares;
  }

  // Number of pieces attacked * value of piece
  evaluateThreats(game: Chess, color: string): number {
    let threatenedSquares = 0;
    let enemyColor = color === Player.White ? Player.Black : Player.White;
    game.board().forEach((row) => {
      row.forEach((square) => {
        if (square?.color === color) {
          if (game.isAttacked(square.square, enemyColor)) {
            threatenedSquares += pieceValue[square.type];
          }
        }
      });
    });
    return threatenedSquares;
  }

  evaluateMaterial(game: Chess, color?: string): number {
    let score = 0;
    game.board().forEach((row) => {
      row.forEach((square) => {
        // What does the second part of the if do?
        if ((color && square && square.color === color) || (!color && square)) {
          // We want to add up the value of the pieces
          // However we should not add if we are looking at the king, since he is worth 99
          if (square.type !== "k") {
            score += pieceValue[square.type];
          }
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
