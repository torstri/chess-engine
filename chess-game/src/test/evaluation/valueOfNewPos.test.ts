import { valueOfNewPos } from "../../chess/utils/Evaluation";
import { Move } from "chess.js";
import { Player } from "../../chess/utils/Types";
import { PSQT } from "../../chess/utils/PSQT";
import { pieceValue } from "../../chess/utils/Constants";


describe("Return the resulting value of moving a piece to a new square", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"      // starting position
    const endGameFen = "7k/8/8/4q3/8/8/8/1K6 w - - 0 1";
    const knight = "n";
    const king = "k";

    it("is equal to value of move: white knight b1 to c3", () => {
        const valueFrom = PSQT.KNIGHT[7][1];
        const valueTo = PSQT.KNIGHT[5][2];
        const move: Move = {
            from: "b1", to: "c3", piece: "n",
            color: "w",
            flags: "",
            san: "",
            lan: "",
            before: "",
            after: ""
        };
        expect(valueOfNewPos(move, Player.White, fen)).toEqual(pieceValue[knight] + (valueTo - valueFrom))
    });

    it("is equal to value of move: black king c3 to c4 in end game", () => {
        const valueFrom = PSQT.KING_ENDGAME[5][2];
        const valueTo = PSQT.KING_ENDGAME[4][2];
        const move: Move = {
            from: "c3", to: "c4", piece: "k",
            color: "b",
            flags: "",
            san: "",
            lan: "",
            before: "",
            after: ""
        };
        expect(valueOfNewPos(move, Player.White, endGameFen)).toEqual(pieceValue[king] + (valueTo - valueFrom));
    });
})