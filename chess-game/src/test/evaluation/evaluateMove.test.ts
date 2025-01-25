import { evaluateMove } from "../../chess/utils/Evaluation";
import { Chess } from "chess.js";
import { Player, stateBias } from "../../chess/utils/Types";
import { pieceValue } from "../../chess/utils/Constants";

describe("Returns move evaluation", () => {

    it("returns value of move: white checks black", () => {
        const fen = "k7/8/8/1B6/8/8/8/3K3R w - - 0 1";          
        const m = "Bc6+"
        const game = new Chess(fen);
        const move = game.move(m);
        expect(evaluateMove(game, move, Player.White)).toEqual(stateBias.inCheck);
    });

    it("returns value of move: black castles king side", () => {    
        const fen = "rnbqk2r/pppp1ppp/5n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 0 1";          
        const m = "O-O";
        const game = new Chess(fen);
        const move = game.move(m);
        expect(evaluateMove(game, move, Player.Black)).toEqual(stateBias.castled);
    });

    it("returns value of move: white captures bishop", () => {    
        const fen = "rnbqk2r/pppp1ppp/5n2/2b1p3/N3P3/5N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1";          
        const m = "Nxc5";
        const bishop = "b";
        const game = new Chess(fen);
        const move = game.move(m);
        expect(evaluateMove(game, move, Player.White)).toEqual(pieceValue[bishop] * 10);
    });
});