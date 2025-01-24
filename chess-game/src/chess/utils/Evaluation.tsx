import { Chess, Move, PieceSymbol, validateFen } from "chess.js";
import { stateBias, Player } from "./Types";
import {
  pieceValue,
  END_GAME_PIECE_AMOUNT,
  MOBILITY_WEIGHT,
  MATERIAL_WEIGHT,
} from "./Constants";
import { PSQT_MAP, getSquareInTable } from "./PSQT";

// Evaluates if a game is end game or not
export function isEndGame(game: Chess): boolean {
  const fenString = game.fen();
  const boardState = fenString.split(" ")[0];

  const pieceCount = boardState.split("").reduce((count, char) => {
    if (/[prnbqkPRNBQK]/.test(char)) {
      return count + 1;
    }
    return count;
  }, 0);

  return pieceCount < END_GAME_PIECE_AMOUNT;
}

export function evaluateMove(game: Chess, move: Move, player: string): number {
  if (game.isGameOver()) {
    return evaluateTerminalState(game, player);
  }

  let moveScore = 0;

  if (game.isCheck())
    moveScore += move.color === player ? stateBias.inCheck : -stateBias.inCheck;

  if (move.san.includes("O-O") || move.san.includes("O-O-O"))
    moveScore += move.color === player ? stateBias.castled : -stateBias.castled;

  // Incentive for capturing / not being captured
  if (move.captured)
    moveScore +=
      move.color == player
        ? pieceValue[move.captured] * 10
        : -10 * pieceValue[move.captured];

  return moveScore;
}

// Evaluates a terminal state
export function evaluateTerminalState(game: Chess, player: String): number {
  let outCome;

  if (game.isCheckmate()) {
    outCome =
      game.turn() === player ? -stateBias.checkMate : stateBias.checkMate;
  } else {
    outCome = stateBias.draw;
  }

  return outCome;
}

// Evaluates a non-terminal state
export function evaluateState(game: Chess, player: string): number {
  let opponent = player === "w" ? "b" : "w";

  // const mobilityScore = mobiltyEvaluation(game, player, opponent);
  const materialScore = materialEvaluation(game, player);
  // const threatScore = threatEvaluation(game, player);
  return MATERIAL_WEIGHT * materialScore;

  // return MOBILITY_WEIGHT * mobilityScore + MATERIAL_WEIGHT * materialScore;
}

export function mobiltyEvaluation(
  game: Chess,
  player: string,
  opponent: string
): number {
  // https://www.chessprogramming.org/Evaluation#General_Aspects
  let playerMobility = 0;
  let opponentMobility = 0;

  let gameFen = game.fen();
  let fenParts = gameFen.split(" ");
  let color = game.turn() === player ? opponent : player;
  fenParts[1] = color;
  let newFen = fenParts.join(" ");

  let gameCopy = new Chess();
  if (validateFen(newFen).ok) {
    gameCopy = new Chess(newFen);
  } else {
    gameCopy = new Chess(game.fen());
    const randomIndex = Math.floor(Math.random() * game.moves().length);
    const randomMove = gameCopy.moves()[randomIndex];
    gameCopy.move(randomMove);
  }

  if (game.turn() === player) {
    playerMobility = evaluateMobility(game, player);
    opponentMobility = evaluateMobility(gameCopy, opponent);
  } else {
    playerMobility = evaluateMobility(gameCopy, player);
    opponentMobility = evaluateMobility(game, opponent);
  }

  return playerMobility - opponentMobility;
}

export function valueOfNewPos(move: Move, color: string): number {
  const from = move.from;
  const to = move.to;
  const piece = move.piece;
  const psqt = PSQT_MAP[piece];

  const squareFrom = getSquareInTable(from, color);
  const squareTo = getSquareInTable(to, color);
  const valueFrom = psqt ? psqt[squareFrom.rowIdx][squareFrom.colIdx] : 0;
  const valueTo = psqt ? psqt[squareTo.rowIdx][squareTo.colIdx] : 0;

  return psqt ? pieceValue[piece] + (valueTo - valueFrom) : 0;
}

export function valueOfSquare(
  piece: PieceSymbol,
  square: string,
  color: string
): number {
  const tableIndex = getSquareInTable(square, color);
  const psqt = PSQT_MAP[piece];

  return psqt
    ? pieceValue[piece] + psqt[tableIndex.rowIdx][tableIndex.colIdx]
    : 0;
}

export function evaluateMobility(game: Chess, color: string): number {
  // https://www.chessprogramming.org/Evaluation#General_Aspects

  // game.turn == color
  const legalMovesMap: { [key: string]: number } = {};
  let newPosVal = 0;
  let defenseValue = 0;

  game.moves({ verbose: true }).forEach((move) => {
    // value[move.piece] * PSQT(move.to)
    newPosVal += valueOfNewPos(move, move.color);
    if (move.captured) {
      // Value of enemy * PSQT(enemy) + Value of piece * PSQT(move.to) - Value of piece * PSQT(move.from)
      newPosVal += valueOfSquare(move.captured, move.to, move.color);
    }

    // Save all squares we can move to with a legal move
    legalMovesMap[move.to] = legalMovesMap[move.to]
      ? legalMovesMap[move.to]++
      : 1;
  });

  game.board().forEach((row) => {
    row.forEach((square) => {
      // We control the square
      if (square?.type && color === square?.color) {
        // We also attack the square, and it is not a legal move
        if (
          game.isAttacked(square.square, color) &&
          !legalMovesMap[square.square]
        ) {
          defenseValue += valueOfSquare(square.type, square.square, color);
        }
      }
    });
  });

  return newPosVal + defenseValue;
}

export function materialEvaluation(game: Chess, player: string): number {
  let playerScore = 0;
  let opponentScore = 0;
  let opponentCount = 0;
  let playerCount = 0;
  game.board().forEach((row) => {
    row.forEach((square) => {
      if (square && square.color == player) {
        playerScore += valueOfSquare(square.type, square.square, square.color);
        playerCount++;
      } else if (square) {
        opponentScore -= valueOfSquare(
          square.type,
          square.square,
          square.color
        );
        opponentCount++;
      }
    });
  });
  // console.log(
  //   "Player Count:",
  //   playerCount,
  //   " and Opponent Count: ",
  //   opponentCount
  // );
  // console.log(
  //   "Player Score: ",
  //   playerScore,
  //   " Opponent score: ",
  //   opponentScore
  // );
  // console.log("Result: ", playerScore + opponentScore);
  return playerScore + opponentScore;
}

// export function threatEvaluation(game: Chess, color: string): number {
//   const whiteThreats = evaluateThreats(game, Player.White);
//   const blackThreats = evaluateThreats(game, Player.Black);
//   const threatEvaluation =
//     color === Player.White
//       ? blackThreats - whiteThreats
//       : whiteThreats - blackThreats;

//   return threatEvaluation;
// }

// export function evaluateThreats(game: Chess, color: string): number {
//   let threatenedSquares = 0;
//   let enemyColor = color === Player.White ? Player.Black : Player.White;
//   game.board().forEach((row) => {
//     row.forEach((square) => {
//       if (square?.color === color) {
//         if (game.isAttacked(square.square, enemyColor)) {
//           threatenedSquares += pieceValue[square.type];
//         }
//       }
//     });
//   });
//   return threatenedSquares;
// }
