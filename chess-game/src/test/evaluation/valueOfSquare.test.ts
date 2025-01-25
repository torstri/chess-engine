import { valueOfSquare } from "../../chess/utils/Evaluation";
import { Player } from "../../chess/utils/Types";
import { PieceSymbol } from "chess.js";
import { pieceValue } from "../../chess/utils/Constants";
import { PSQT } from "../../chess/utils/PSQT";

describe("Return the value of a piece on a square on the board", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";     // starting position
    const endGameFen = "8/8/1P6/8/8/8/8/8 w - - 0 1";       // pawn on b6
    const pawn: PieceSymbol = "p";
    const knight: PieceSymbol = "n";
    const king: PieceSymbol = "k";
    
    it("is equal to white pawn on a2", () => {
        expect(valueOfSquare(pawn, "a2", Player.White, fen)).toEqual(pieceValue[pawn] + PSQT.PAWN[6][0]);
    });

    it("is equal to black pawn on a7", () => {
        expect(valueOfSquare(pawn, "a7", Player.Black, fen)).toEqual(pieceValue[pawn] + PSQT.PAWN[6][7]);
    });

    it("is equal to white knight on d5", () => {
        expect(valueOfSquare(knight, "d5", Player.White, fen)).toEqual(pieceValue[knight] + PSQT.KNIGHT[3][4]);
    });

    it("is equal to white pawn on b6 in end game", () => {
        expect(valueOfSquare(pawn, "b6", Player.White, endGameFen)).toEqual(pieceValue[pawn] + PSQT.PAWN_ENDGAME[2][1]);
    });
    
    it("is equal to black king on b6 in end game", () => {
        expect(valueOfSquare(king, "b6", Player.Black, endGameFen)).toEqual(pieceValue[king] + PSQT.KING_ENDGAME[2][1]);
    });
    
});