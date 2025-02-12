import { valueOfSquare } from "../chess/utils/Evaluation";
import { Player } from "../chess/utils/Types";
import { Chess, PieceSymbol } from "chess.js";
import { pieceValue } from "../chess/utils/Constants";
import { PSQT } from "../chess/utils/PSQT";
import { Node } from "../chess/Node";
import { ChessAI } from "../chess/chessAI";
import { State } from "../chess/State";

describe("Tests the different parts of tree search", () => {
  it("is equal to best child node", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // starting position

    const game = new Chess(fen);
    const state = new State(fen);
    const chessAI = new ChessAI(game, "w", 400);

    // Generate the nodes for the tree
    let root = new Node(state, "w", 0);

    // Left side of tree
    let possibleMovesRoot = game.moves();
    game.move(possibleMovesRoot[0]);
    let state1 = new State(game.fen());

    let child1 = new Node(state1, "b", 1);

    let possibleMovesChild1 = game.moves();
    game.move(possibleMovesChild1[0]);
    let state11 = new State(game.fen());

    let child11 = new Node(state11, "w", 2);
    game.undo();

    game.move(possibleMovesChild1[1]);
    let state12 = new State(game.fen());
    let child12 = new Node(state12, "w", 2);

    game.undo();
    game.undo();

    // Right side of the tree
    game.move(possibleMovesRoot[1]);
    let state2 = new State(game.fen());
    let child2 = new Node(state2, "b", 1);

    let possibleMovesChild2 = game.moves();
    game.move(possibleMovesChild2[0]);
    let state21 = new State(game.fen());
    let child21 = new Node(state21, "w", 2);

    // Assemble the tree
    // Parent relations
    chessAI.root = root;
    child21.parent = child2;
    child11.parent = child1;
    child12.parent = child1;
    child1.parent = chessAI.root;
    child2.parent = chessAI.root;

    // Child relations
    child1.addChildByNode(child11);
    child1.addChildByNode(child12);
    child2.addChildByNode(child21);
    chessAI.root.addChildByNode(child1);
    chessAI.root.addChildByNode(child2);

    // Setup initial values
    child12.state.totalScore = -30;
    child12.visits = 1;
    child11.state.totalScore = 2000;
    child11.visits = 1;

    child1.state.totalScore = -(
      child12.state.totalScore + child11.state.totalScore
    );
    child1.visits = 2;

    child21.state.totalScore = 2000;
    child21.visits = 2;

    child2.state.totalScore = -child21.state.totalScore;
    child2.visits = 2;

    chessAI.root.visits = 4;
    chessAI.root.state.totalScore = -(
      child1.state.totalScore + child2.state.totalScore
    );

    let selectedChild = chessAI.selection(chessAI.root);

    expect(selectedChild.state.fen).toEqual(child11.state.fen);
  });

  it("propagates given value throughout tree", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // starting position

    const game = new Chess(fen);
    const state = new State(fen);
    const chessAI = new ChessAI(game, "w", 400);

    // Generate the nodes for the tree
    let root = new Node(state, "w", 0);

    // Left side of tree
    let possibleMovesRoot = game.moves();
    game.move(possibleMovesRoot[0]);
    let state1 = new State(game.fen());

    let child1 = new Node(state1, "b", 1);

    let possibleMovesChild1 = game.moves();
    game.move(possibleMovesChild1[0]);
    let state11 = new State(game.fen());

    let child11 = new Node(state11, "w", 2);
    game.undo();

    game.move(possibleMovesChild1[1]);
    let state12 = new State(game.fen());
    let child12 = new Node(state12, "w", 2);

    // Undo game back to original
    game.undo();
    game.undo();

    // Right side of the tree
    game.move(possibleMovesRoot[1]);
    let state2 = new State(game.fen());
    let child2 = new Node(state2, "b", 1);
    game.undo();

    // Add child relations

    child1.addChildByNode(child11);
    child1.addChildByNode(child12);
    chessAI.root = root;
    chessAI.root.addChildByNode(child1);
    chessAI.root.addChildByNode(child2);

    // Add parent relations
    child11.parent = child1;
    child12.parent = child1;
    child1.parent = chessAI.root;
    child2.parent = chessAI.root;

    // Set scores
    child11.state.totalScore = 0;
    child12.state.totalScore = 0;
    child1.state.totalScore = 0;
    child2.state.totalScore = 0;
    chessAI.root.state.totalScore = 0;

    // Propagate values: even depth -> -value, odd depths -> value
    chessAI.propagate(child11, 1);

    expect(child11.state.totalScore).toEqual(-1);
    expect(child12.state.totalScore).toEqual(0);
    expect(child1.state.totalScore).toEqual(1);
    expect(child2.state.totalScore).toEqual(0);
    expect(chessAI.root.state.totalScore).toEqual(-1);
  });
});
