import { Chess } from "chess.js";
import { newMobilityEvaluation } from "../../chess/utils/Evaluation";
import { Player } from "../../chess/utils/Types";


describe("Mobility evaluation", () => {


    it("is zero in starting position", () => {
        expect(newMobilityEvaluation(new Chess(), Player.White)).toEqual(0);
    })

    it("is greater than zero when player attacks more pieces", () => {
        // fen representation:
        // 8  .  .  .  .  .  .  .  k
        // 7  .  .  .  .  .  .  .  .
        // 6  .  .  .  .  .  .  .  .
        // 5  .  .  .  .  .  .  .  .
        // 4  .  .  R  .  b  .  .  .
        // 3  .  .  .  .  .  .  .  .
        // 2  .  .  .  .  R  .  .  .
        // 1  K  .  .  .  .  .  .  .
        //    a  b  c  d  e  f  g  h
        const fen = "7k/8/8/8/2R1b3/8/4R3/K7 w - - 0 1";

        expect(newMobilityEvaluation(new Chess(fen), Player.White)).toBeGreaterThan(0);
    });

    it("is less than zero when opponent attacks more pieces", () => {
        // fen representation:
        // 8  .  .  .  .  .  .  .  k
        // 7  .  .  .  .  .  .  .  .
        // 6  .  .  b  .  r  .  .  .
        // 5  .  .  .  .  .  .  .  .
        // 4  .  .  .  .  P  .  .  .
        // 3  .  .  .  .  .  .  .  .    
        // 2  .  .  .  .  .  .  .  .
        // 1  K  .  .  .  .  .  .  .
        //    a  b  c  d  e  f  g  h
        const fen = "7k/8/2b1r3/8/4P3/8/8/K7 w - - 0 1";

        expect(newMobilityEvaluation(new Chess(fen), Player.White)).toBeLessThan(0);
    });
})
