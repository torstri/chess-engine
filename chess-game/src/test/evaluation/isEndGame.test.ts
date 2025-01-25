import { isEndGame } from "../../chess/utils/Evaluation";

describe("isEndGame", () => {
  it("returns true when the total number of pieces is less than the endgame threshold", () => {
    const fen = "8/8/8/8/8/8/8/3K4 w - - 0 1"; // Only one king on the board
    expect(isEndGame(fen)).toBe(true);
  });

  it("returns false when the total number of pieces equals or exceeds the endgame threshold", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Starting chess position
    expect(isEndGame(fen)).toBe(false);
  });

  it("handles FEN strings with a mix of pieces and empty squares", () => {
    const fen = "8/8/8/8/4k3/3P4/8/4K3 w - - 0 1"; // King and pawn for each side
    expect(isEndGame(fen)).toBe(true);
  });

  it("returns true for an empty board", () => {
    const fen = "8/8/8/8/8/8/8/8 w - - 0 1"; // Completely empty board
    expect(isEndGame(fen)).toBe(true);
  });
});
