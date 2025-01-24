import { Chess, Move, PieceSymbol} from "chess.js";
import { Node } from "./Node";
import { State } from "./State";
import { C, MAXDEPTH, ALLOWED_DURATION } from "./utils/Constants";
import { evaluateTerminalState, sumPieceSquareEvaluation, evaluateMaterial, evaluateMobility, evaluateThreats } from "./utils/Evaluation";
import { Player } from "./utils/Types";

// Statistics
let selectionCount = 0;
let rolloutCount = 0;
let expansionCount = 0;
let selectionTime = 0;
let rolloutTime = 0;
let expansionTime = 0;


export class ChessAI {
  player: string;
  root: Node | undefined;

  constructor(game: Chess, player: string) {
    this.player = player;
    this.root = new Node(new State(game.fen()), player, 0);
    this.root.nodeExpansion(player);
  }

  // Monte Carlo Tree Search
  makeMove(game: Chess): Move {

    this.root = new Node(new State(game.fen()), this.player, 0);

    const startTime = Date.now();
    let tempTime = startTime;
    let current: Node = this.root;
    while (Date.now() - startTime < ALLOWED_DURATION) {
      // Tree traversal phase
      if (!current.isLeaf()) {
        current = this.getMaxUCBnode(current);
      } else if (current.visits > 0) {
        // Node expansion phase
        tempTime = Date.now();
        current.nodeExpansion(this.player);
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

    this.consoleLogs(game, this.player);

    rolloutCount = 0;
    expansionCount = 0;
    rolloutTime = 0;
    expansionTime = 0;

    return this.getBestMove(this.root);
  }

  getBestMove(root: Node, verbose?: boolean): Move {

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

    if(verbose) {
      console.log("------------ New Move --------------");
      const visits = this.root?.visits;
      const score = this.root?.state.totalScore;
      if (visits && score && verbose) {
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
    }

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
    if (game.isGameOver()) return evaluateTerminalState(game, this.player);

    if (depth > MAXDEPTH) {
      return sumPieceSquareEvaluation(game, this.player);
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

    if (n == 0 || N == 0) return Infinity;

    return score / n + C * Math.sqrt(Math.log(N) / n);
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
  }
  
  consoleLogs(game: Chess, color: string) {
    const whiteMobility = evaluateMobility(game, this.player, Player.White);
    const blackMobility = evaluateMobility(game, this.player, Player.Black);

    // Normalize
    const mobilityScore =
      color === Player.White
        ? whiteMobility - blackMobility
        : blackMobility - whiteMobility;

    const whiteMaterial = evaluateMaterial(game, Player.White);
    const blackMaterial = evaluateMaterial(game, Player.Black);

    const materialScore =
      color === Player.White
        ? whiteMaterial - blackMaterial
        : blackMaterial - whiteMaterial;

    const whiteThreats = evaluateThreats(game, Player.White);
    const blackThreats = evaluateThreats(game, Player.Black);
    const alternatvetTthreatEvaluation =
      color === Player.White
        ? blackThreats - whiteThreats
        : whiteThreats - blackThreats;
    const threatEvaluation = evaluateThreats(game, color);
    console.log("Mobility Score: ", 0.1 * mobilityScore);
    console.log("Material Score: ", materialScore);
    console.log("Threat Score: ", -threatEvaluation);
    console.log("Alt Threat Score: ", alternatvetTthreatEvaluation);

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
  }
}
