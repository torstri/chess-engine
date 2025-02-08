export interface ChessOpening {
  name: string;
  fen: string;
}

export const openings: ChessOpening[] = [
  {
    name: "Standard Starting Position",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // 'start' is recognized by chess.js as the default position
  },
  {
    name: "Italian Game",
    fen: "r1bqk1nr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5",
  },
  {
    name: "Ruy-Lopez",
    fen: "r1bqk1nr/pppp1ppp/2n5/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R w KQkq - 4 5",
  },
  {
    name: "Scotch Game",
    fen: "r1bqk1nr/pppp1ppp/2n5/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 4 5",
  },
  {
    name: "Sicilian Defense",
    fen: "r1bqkb1r/pp2pppp/2np4/8/2Pp4/5N2/PP1P1PPP/RNBQKB1R w KQkq - 4 5",
  },
  {
    name: "French Defense",
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 4 5",
  },
  {
    name: "Caro-Kann Defense",
    fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 4 5",
  },
  {
    name: "Queen's Gambit",
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 4 5",
  },
  {
    name: "King's Indian Defense",
    fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 4 5",
  },
  {
    name: "Grünfeld Defense",
    fen: "rnbqk2r/ppppppbp/6p1/8/2PPn3/8/PP2PPPP/RNBQKBNR w KQkq - 4 5",
  },
  {
    name: "English Opening",
    fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/5N2/PP1PPP1P/RNBQKB1R w KQkq - 4 5",
  },
];
