import { Chess, Move, PieceSymbol } from "chess.js";
import { stateBias, Player } from "./Types";
import { pieceValue } from "./Constants";
import { PSQT, getSquareInTable } from "./PSQT";

export function evaluateTerminalState(game: Chess, player: String): number {
    let win;

    if (game.isCheckmate()) {
      win = game.turn() == player ? -stateBias.checkMate : stateBias.checkMate;
    } else {
      win = stateBias.draw;
    }

    return win;
  }

  export function evaluateState(game: Chess, player: string, move: Move): number {
    let score = 0;

    if (game.isCheck())
      score += move.color == player ? stateBias.inCheck : -stateBias.inCheck;

    if (move.san.includes('O-O') || move.san.includes('O-O-O')) 
      score += move.color == player ? stateBias.castled : -stateBias.castled;

    if (move.captured)
      score +=
        move.color == player
          ? pieceValue[move.captured] * 10
          : -10 * (pieceValue[move.captured]);

    if (move.color == player) {
      const square = getSquareInTable(move);
      score += pieceSquareEvaluation(square.rowIdx, square.colIdx, move.piece);
    }

    const mobilityScore = mobiltyEvaluation(game, player);
    const materialScore = materialEvaluation(game, player);
    const threatScore = threatEvaluation(game, player);

    return 0.1 * mobilityScore + 2 * materialScore + 0.5 * threatScore + score;
  }

  export function mobiltyEvaluation(game: Chess, color: string): number {
    const whiteMobility = evaluateMobility(game, color, Player.White);
    const blackMobility = evaluateMobility(game, color, Player.Black);

    const mobilityScore =
      color === Player.White
        ? whiteMobility - blackMobility
        : blackMobility - whiteMobility;

    return mobilityScore;
  }

  export function evaluateMobility(game: Chess, player: string, color: string): number {

    const attackedSquaresMap: { [key: string]: number } = {};

    let attackedSquares = 0; // Keeps track of our legal moves

    if (game.turn() !== player) {
      let gameFen = game.fen();
      let fenParts = gameFen.split(" ");

      fenParts[1] = color; // Set the turn to the desired color

      let newFen = fenParts.join(" ");

      let newGame = new Chess();

      try {
        newGame.load(newFen);
      } catch (error) {
        newGame = game;
        const randomIndex = Math.floor(Math.random() * game.moves().length);
        const randomMove = newGame.moves()[randomIndex];
        newGame.move(randomMove);
      }

      newGame.moves({ verbose: true }).forEach((move) => {
        attackedSquaresMap[move.to] = attackedSquaresMap[move.to]
          ? 1
          : attackedSquaresMap[move.to] + 1;
        attackedSquares++;
      });
    } else {
      game.moves({ verbose: true }).forEach((move) => {
        attackedSquaresMap[move.to] = attackedSquaresMap[move.to]
          ? 1
          : attackedSquaresMap[move.to] + 1;
        attackedSquares++;
      });
    }

    let defendedSquares = 0;
    game.board().forEach((row) => {
      row.forEach((square) => {
        if (square?.square && color === square.color) {
          if (!attackedSquaresMap[square.square]) {
            defendedSquares += game.isAttacked(square.square, square.color)
              ? 1 * pieceValue[square.type]
              : 0;
          }
        }
      });
    });

    return defendedSquares + attackedSquares;
  }

  export function materialEvaluation(game: Chess, color: string): number {
    const whiteMaterial = evaluateMaterial(game, Player.White);
    const blackMaterial = evaluateMaterial(game, Player.Black);

    const materialScore =
      color === Player.White
        ? whiteMaterial - blackMaterial
        : blackMaterial - whiteMaterial;

    return materialScore;
  }

  export function evaluateMaterial(game: Chess, color?: string): number {
    let score = 0;
    game.board().forEach((row) => {
      row.forEach((square) => {

        if ((color && square && square.color === color) || (!color && square)) {
          if (square.type !== "k") {
            score += pieceValue[square.type];
          }
        }
      });
    });

    return score;
  }


  export function threatEvaluation(game: Chess, color: string): number {
    const whiteThreats = evaluateThreats(game, Player.White);
    const blackThreats = evaluateThreats(game, Player.Black);
    const threatEvaluation =
      color === Player.White
        ? blackThreats - whiteThreats
        : whiteThreats - blackThreats;

    return threatEvaluation;
  }

  export function evaluateThreats(game: Chess, color: string): number {
      let threatenedSquares = 0;
      let enemyColor = color === Player.White ? Player.Black : Player.White;
      game.board().forEach((row) => {
        row.forEach((square) => {
          if (square?.color === color) {
            if (game.isAttacked(square.square, enemyColor)) {
              threatenedSquares += pieceValue[square.type];
            }
          }
        });
      });
      return threatenedSquares;
    }
  
  export function sumPieceSquareEvaluation(game: Chess, player: string): number {
    let score = 0;
    game.board().forEach((row, rowIdx) => {
      row.forEach((square, colIdx) => {
        if (square) { 

          if(square.color == player) 
            score += pieceSquareEvaluation(rowIdx, colIdx, square.type);
          // else
          //   score -= pieceSquareEvaluation(rowIdx, colIdx, square.type);

        }
      });
    });

    return score;
  }

  export function pieceSquareEvaluation(rowIdx: number, colIdx: number, piece: PieceSymbol): number {

    const PSQT_MAP: { [key in PieceSymbol]?: number[][] } = {
      p: PSQT.PAWN,   
      b: PSQT.BISHOP, 
      n: PSQT.KNIGHT, 
      r: PSQT.ROOK,   
      q: PSQT.QUEEN,  
    };
  
    return PSQT_MAP[piece] ? PSQT_MAP[piece][rowIdx][colIdx] : 0;
  }