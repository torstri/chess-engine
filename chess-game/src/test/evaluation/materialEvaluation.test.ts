import { Chess } from "chess.js";
import { materialEvaluation } from "../../chess/utils/Evaluation";
import { Player } from "../../chess/utils/Types";


describe("Material evaluation", () => {
    const fen = "6k1/4n1p1/8/8/8/8/3Q3P/4K3 w - - 0 1"      // white has queen, rook and pawn, black has knight and pawn
    const game = new Chess(fen);


    it("is zero in starting position", () => {
        expect(materialEvaluation(new Chess, Player.White)).toEqual(0);
    });

    it("is greater than zero when player has greater material value", () => {
        expect(materialEvaluation(game, Player.White)).toBeGreaterThan(0);
    });

    it("is less than zero when opponent has greater material value", () => {
        expect(materialEvaluation(game, Player.Black)).toBeLessThan(0);
    });
})