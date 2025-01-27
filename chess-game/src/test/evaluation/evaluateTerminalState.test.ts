import { evaluateTerminalState } from "../../chess/utils/Evaluation";
import { stateBias, Player } from "../../chess/utils/Types";
import { Chess } from "chess.js";

describe("terminal game state evaluation", () => {
    const checkMateFen = "K7/8/8/8/8/8/5Q2/4Q2k b - - 0 1"   // black is checkmated
    const drawFen = "8/8/8/8/8/8/5k2/6K1 w - - 0 1"
    
    it("is value of checkmate when opponent is checkmated", () => {
        const game = new Chess(checkMateFen);
        expect(evaluateTerminalState(game, Player.White)).toEqual(stateBias.checkMate);
    });

    it("is value of negative checkmate when player is checkmated", () => {
        const game = new Chess(checkMateFen);
        expect(evaluateTerminalState(game, Player.Black)).toEqual(-stateBias.checkMate);
    });

    it("is value of draw when game ends in a draw", () => {
        const game = new Chess(drawFen);
        expect(evaluateTerminalState(game, Player.White)).toEqual(stateBias.draw);
    });
})