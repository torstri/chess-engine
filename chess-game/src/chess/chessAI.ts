import { Chess, Move, PieceSymbol, Color } from "chess.js";
import { Node } from "./Node";
import { State } from "./State";
import {
  C,
  MAXDEPTH,
  ALLOWED_DURATION,
  MOBILITY_WEIGHT,
  MATERIAL_WEIGHT,
} from "./utils/Constants";
import {
  evaluateTerminalState,
  evaluateState,
  evaluateMove,
  evaluateMobility,
  materialEvaluation,
  mobiltyEvaluation,
  clampEvaluation,
} from "./utils/Evaluation";

import { Player } from "./utils/Types";

export class ChessAI {
  player: Color;
  root: Node | undefined;
  maxDuration: number = 200;

  iterations: number = 0;

  selectionCounter: number = 0;
  selectionTime: number = 0;

  expansionCounter: number = 0;
  expansionTime: number = 0;

  rolloutCounter: number = 0;
  rolloutTime: number = 0;

  propagationCounter: number = 0;
  propagationTime: number = 0;

  constructor(game: Chess, player: Color, maxDuration: number) {
    this.player = player;
    this.root = new Node(new State(game.fen()), player, 0);
    this.root.nodeExpansion(player);
    this.maxDuration = maxDuration;
    console.log(
      "Hello world! CURRENT VERSION PLAYING AS: ",
      this.player === "w" ? " WHITE!" : " BLACK!",
      " MAX DURATION = ",
      this.maxDuration
    );
  }

  // Selects a child node until we reach a terminal or leaf node
  // Nodes are select to maximize UCB formula
  selection(node: Node): Node {
    let leafFound = false;
    let iterations = 0;
    while (!leafFound) {
      if (node.isLeaf() || node.isTerminal()) {
        leafFound = true;
      } else {
        node = this.getMaxUCBnode(node);
      }
      iterations++;
    }
    // console.log("In selection, went to depth: ", node.depth);
    return node;
  }

  // Monte Carlo Tree Search
  makeMove(game: Chess): Move {
    // console.log("Current version making move for:", this.player);
    let tempTime = 0;
    let statistics = true;

    this.iterations = 0;

    // this.selectionCounter = 0;
    // this.selectionTime = 0;

    this.expansionCounter = 0;
    this.expansionTime = 0;

    this.rolloutCounter = 0;
    this.rolloutTime = 0;

    // this.propagationCounter = 0;
    // this.propagationTime = 0;

    const startTime = Date.now();

    this.root = new Node(new State(game.fen()), this.player, 0);

    this.root.nodeExpansion(this.player);
    this.expansionTime += Date.now() - startTime;
    this.expansionCounter++;

    while (Date.now() - startTime < this.maxDuration) {
      // 1. Selection
      // tempTime = Date.now();
      let leafNode = this.selection(this.root);
      // this.selectionTime += Date.now() - tempTime;
      // this.selectionCounter++;

      // 2. Expansion (if visited before, no children and not terminal)
      if (leafNode.isLeaf() && leafNode.visits > 0 && !leafNode.isTerminal()) {
        tempTime = Date.now();
        leafNode.nodeExpansion(this.player);
        this.expansionTime += Date.now() - tempTime;
        this.expansionCounter++;
        // find a new leaf;
        leafNode = this.getMaxUCBnode(leafNode);
      }

      // 3. Rollout
      tempTime = Date.now();
      let gameCopy = new Chess(leafNode.state.fen);
      const rolloutResult = this.rollout(gameCopy, 0, leafNode.depth);
      this.rolloutTime += Date.now() - tempTime;
      this.rolloutCounter++;

      // 4. Propogation
      // tempTime = Date.now();
      this.propagate(leafNode, rolloutResult);
      // this.propagationTime += Date.now() - tempTime;
      // this.propagationCounter++;

      this.iterations++;
    }

    if (statistics) {
      this.showStatistics();
    }

    return this.getBestMove(this.root);
  }

  // When done performing mcts
  // We return the node which accumulted the highest score
  getBestMove(root: Node): Move {
    let move: Move | undefined;
    let maxScore = -Infinity;
    let mostVisits = -Infinity;

    // We should choose between one of these

    // root.children.forEach((ch: Node) => {
    //   if (ch.totalScore > maxScore) {
    //     move = ch.move;
    //     maxScore = ch.totalScore;
    //   }
    // });

    // This one seems very promising but for some reason
    // Ends up in weird local optima
    // Either it is because the expansion rate drops
    // Or because the rollout time shoots
    root.children.forEach((child) => {
      if (child.visits > mostVisits) {
        move = child.move;
        mostVisits = child.visits;
      }
    });

    // root.children.forEach((child) => {
    //   let avergageScore = child.totalScore / child.visits;
    //   if (avergageScore) {
    //     move = child.move;
    //     maxScore = avergageScore;
    //   }
    // });

    if (!move) throw new Error("No move found");

    return move;
  }

  // Returns the child node with the highest UCB value
  getMaxUCBnode(node: Node): Node {
    let maxUCB = -Infinity;
    let selectedChild: Node | undefined;
    node.children.forEach((child: Node) => {
      const ucb = this.ucb1(child.totalScore, node.visits, child.visits);
      if (ucb > maxUCB) {
        selectedChild = child;
        maxUCB = ucb;
      }
    });

    if (selectedChild) {
      node = selectedChild;
    } else {
      throw new Error("No child found");
    }

    return node;
  }

  // Alternative way of doing max ucb
  getMaxUCBnode1(node: Node): Node {
    const selectedChild = node.children.reduce(
      (best, child) =>
        this.ucb1(child.totalScore, node.visits, child.visits) >
        this.ucb1(best.totalScore, node.visits, best.visits)
          ? child
          : best,
      node.children[0]
    );

    if (!selectedChild) throw new Error("No child found");
    return selectedChild;
  }

  // Propogates a value from a node to the root
  propagate(current: Node, score: number): void {
    // On nodes with even depths, we are making moves
    // On nodes with odd depths, opponent is making moves
    // We want to maximize UCB, opponent wants to minimize UCB

    // Thus nodes with an odd depth will get +score, since in the parent node
    // the depth will be even, we are making a move and want to chose the
    // one with the highest score

    // Nodes with an even depth will get -score, since in the parent node
    // the depth will be odd, meaning that the oppoent is about to make a move
    // and he wants to minimize our position i.e. chosing the child node with the lowest score
    // this is the same as choosing the node with the highest score if the scores are flipped

    score = current.depth % 2 === 0 ? -score : score;
    current.addScore(score);
    current.visits++;

    while (current.parent) {
      current = current.parent;
      score = -score;
      current.addScore(score);
      current.visits++;
    }
  }

  // Plays a set of random moves to simulate play from a given node
  rollout(
    game: Chess,
    depth: number,
    startingDepth: number,
    move?: Move
  ): number {
    // Base case: we have reached a terminal state
    if (game.isGameOver()) {
      console.log(
        "Found terminal state with evaluation: " +
          evaluateTerminalState(game, this.player, startingDepth)
      );
      return evaluateTerminalState(game, this.player, startingDepth);
    }

    // Base care: not terminal but exceeded depth
    if (depth > MAXDEPTH) {
      let score = evaluateState(game, this.player);
      score += move ? evaluateMove(game, move, this.player, startingDepth) : 0;
      // console.log("Evaluated non terminal to: " + clampEvaluation(score));
      return clampEvaluation(score);
    }

    // Otherwise continue rollout
    const randomIndex = Math.floor(Math.random() * game.moves().length);
    const randomMove = game.moves({ verbose: true })[randomIndex];

    try {
      game.move(randomMove);
    } catch (e) {
      console.error("MOVE: ", randomMove);
      throw new Error("INVALID MOVE");
    }

    return this.rollout(game, depth + 1, startingDepth, randomMove);
  }

  // Formula used to determine the UCB value of a node
  ucb1(score: number, N: number, n: number): number {
    if (n == 0 || N == 0) return Infinity;

    const annealing = 1 - 0.05 * this.iterations;

    let thing = annealing > 0 ? annealing * C : C;

    let explorationConstant = thing * Math.sqrt(Math.log(N) / n);
    if (explorationConstant < 0) {
      console.log("Annealing = ", annealing);
      console.log("Thing = ", thing);
      console.log("Exploration constant = ", explorationConstant);
    }
    return score / n + explorationConstant;
  }

  showStatistics() {
    console.log("########## New Move ##########");
    console.log("Simulations: ", this.iterations);
    // console.log(
    //   "Selection time: ",
    //   this.selectionTime,
    //   "ms counter: ",
    //   this.selectionCounter,
    //   " and average time: ",
    //   this.selectionTime / this.selectionCounter
    // );
    console.log(
      "Expansion time: ",
      this.expansionTime,
      "ms counter: ",
      this.expansionCounter,
      " and average time: ",
      this.expansionTime / this.expansionCounter
    );
    console.log(
      "Rollout time: ",
      this.rolloutTime,
      "ms counter: ",
      this.rolloutCounter,
      " and average time: ",
      this.rolloutTime / this.rolloutCounter
    );
    // console.log(
    //   "Propagation time: ",
    //   this.propagationTime,
    //   "ms counter: ",
    //   this.propagationCounter,
    //   " and average time: ",
    //   this.propagationTime / this.propagationCounter
    // );
  }
}
