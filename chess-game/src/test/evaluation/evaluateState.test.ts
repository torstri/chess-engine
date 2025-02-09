import { evaluateMove, evaluateState } from "../../chess/utils/Evaluation";
import { Chess } from "chess.js";
import { Player, stateBias } from "../../chess/utils/Types";
import { pieceValue } from "../../chess/utils/Constants";

describe("Ensures robust evaluation over color", () => {
  it("checks white and black correctly evaluate position", () => {
    const whiteFen =
      "1n2k1r1/7p/3p1p2/1q3p2/1P1P1B2/2NB1P1N/P6P/1R1Q1RK1 w - - 0 1";
    const whiteGame = new Chess(whiteFen);

    const blackFen1 =
      "1kr1q1r1/p6p/n1p1bn2/2b1p1p1/2P3Q1/2P1P3/P7/1R1K2N1 b - - 0 1";
    const blackFen2 =
      "1r1q1rk1/p6p/2nb1p1n/1p1p1b2/1Q3P2/3P1P2/8/1N2K1R1 b - - 0 1";
    const blackGame1 = new Chess(blackFen1);
    const blackGame2 = new Chess(blackFen2);

    // const moveWhite = whiteGame.move("a3");
    // const moveBlack1 = blackGame1.move("h6");
    // const moveBlack2 = blackGame2.move("a6");

    const blackEvaluation1 = evaluateState(blackGame1, "b");
    const blackEvaluation2 = evaluateState(blackGame2, "b");
    const whiteEvaluation = evaluateState(whiteGame, "w");

    expect(blackEvaluation1).toEqual(whiteEvaluation);
    // expect(blackEvaluation2).toEqual(whiteEvaluation);
  });
  it("checks white and black correctly evaluate simple position", () => {
    const whiteFen = "8/4k3/2n2p2/4N3/4KN2/8/8/8 w - - 0 1";
    const whiteGame = new Chess(whiteFen);

    const blackFenMirrored = "8/8/8/4kn2/4n3/2N2P2/4K3/8 b - - 0 1";
    const blackFen = "8/8/8/2nk4/3n4/2P2N2/3K4/8 b - - 0 1";
    const blackGameMirrored = new Chess(blackFenMirrored);
    const blackGame = new Chess(blackFen);

    // const moveWhite = whiteGame.move("a3");
    // const moveBlackMirrored = blackGameMirrored.move("h6");
    // const moveBlack = blackGame.move("a6");

    const blackEvaluationMirrored = evaluateState(blackGameMirrored, "b");
    const blackEvaluation = evaluateState(blackGame, "b");
    const whiteEvaluation = evaluateState(whiteGame, "w");

    expect(blackEvaluation).toEqual(whiteEvaluation);
    expect(blackEvaluationMirrored).toEqual(whiteEvaluation);
  });
});
