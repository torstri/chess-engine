import { Chess, Move, PieceSymbol, validateFen, Color } from "chess.js";
import { stateBias, Player } from "./Types";
import {
  pieceValue,
  END_GAME_PIECE_AMOUNT,
  MOBILITY_WEIGHT,
  MATERIAL_WEIGHT,
} from "./Constants";
import { PSQT_MAP, getSquareInTable, PSQT } from "./PSQT";

// Evaluates if a game is end game or not
export function isEndGame(fen: string): boolean {
  const boardState = fen.split(" ")[0];

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

  const mobilityScore = newMobilityEvaluation(game, player);
  const materialScore = materialEvaluation(game, player);
  // const threatScore = threatEvaluation(game, player);
  // console.log(
  //   "Player: ",
  //   player,
  //   " Mobility Score: ",
  //   mobilityScore,
  //   " Material Score: ",
  //   materialScore
  // );
  return MATERIAL_WEIGHT * materialScore + mobilityScore * MOBILITY_WEIGHT;
  // console.log("Mobility score: ", mobilityScore);
  // console.log("Material score: ", materialScore);

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

export function valueOfNewPos(move: Move, color: string, fen: string): number {
  const from = move.from;
  const to = move.to;
  const piece = move.piece;
  let psqt = PSQT_MAP[piece];

  if (piece === "p" && isEndGame(fen)) {
    psqt = PSQT.PAWN_ENDGAME;
  }
  if (piece === "k" && isEndGame(fen)) {
    psqt = PSQT.KING_ENDGAME;
  }
  const squareFrom = getSquareInTable(from, color);
  const squareTo = getSquareInTable(to, color);
  const valueFrom = psqt ? psqt[squareFrom.rowIdx][squareFrom.colIdx] : 0;
  const valueTo = psqt ? psqt[squareTo.rowIdx][squareTo.colIdx] : 0;

  return psqt ? pieceValue[piece] + (valueTo - valueFrom) : 0;
}

export function valueOfSquare(
  piece: PieceSymbol,
  square: string,
  color: string,
  fen: string
): number {
  const tableIndex = getSquareInTable(square, color);
  let psqt = PSQT_MAP[piece];

  if (piece === "p" && isEndGame(fen)) {
    psqt = PSQT.PAWN_ENDGAME;
    // console.log("Found endgame and pawn: ", psqt);
  }

  if (piece === "k" && isEndGame(fen)) {
    psqt = PSQT.KING_ENDGAME;
    // console.log("Found endgame and king: ", psqt);
  }

  return psqt
    ? pieceValue[piece] + psqt[tableIndex.rowIdx][tableIndex.colIdx]
    : 0;
}

export function newMobilityEvaluation(game: Chess, player: string): number {
  // For a given square we have the following properties:
  // Occupation: which color occupies the square -> player | opponent | null
  // AttackedBy: which color attacks the square -> player | opponent | p & o | null
  // Therefore we have 12 dfferent possibilities (?)

  // SINCE WE DO NOT KNOW WHICH PIECE IS ATTACKING A SQUARE
  // WE IGNORE THE CASE WHERE THE SQUARE IS UNOCCUPIED
  // BOTH COLORS ATTACK THE SQUARE

  // We want to determine the difference in our attacking and attacked status
  // So perhaps it will be like this:
  // Iterate over each square
  // Only consder sqaures which are only attacked by one color
  // Then we have four possibilities:
  // Occupancy -> player | opponent | null
  // Attacker -> player | opponent
  // However, .board represents empty squares as null so we do not know which
  // square that is :( so we need to ignore unoccupied squares

  let fen = game.fen();

  let playerMobility = 0;
  let opponentMobility = 0;

  let playerColor: Color = player === "w" ? "w" : "b";
  let opponent: Color = player === "w" ? "b" : "w";

  game.board().forEach((row) => {
    row.forEach((square) => {
      // If we have square object, the square is occupied
      if (square) {
        let isAttackedByPlayer = game.isAttacked(square?.square, playerColor);
        let isAttackedByOpponent = game.isAttacked(square.square, opponent);
        // If both players attack we do nothing
        if (isAttackedByPlayer && isAttackedByOpponent) {
          return; // Might lead to unexpected behaviour
          // Attacked by only player
        } else if (isAttackedByPlayer) {
          // Occupied by player
          if (square.color === playerColor) {
            playerMobility += valueOfSquare(
              square.type,
              square.square,
              player,
              fen
            );
            // Occupied by opponent
          } else {
            playerMobility += valueOfSquare(
              square.type,
              square.square,
              opponent,
              fen
            );
          }
          // Attacked by only opponent
        } else if (isAttackedByOpponent) {
          // Occupied by player
          if (square.color === playerColor) {
            opponentMobility += valueOfSquare(
              square.type,
              square.square,
              player,
              fen
            );

            // Occupied by opponent
          } else {
            opponentMobility += valueOfSquare(
              square.type,
              square.square,
              opponent,
              fen
            );
          }
        } else {
          // Attacked by none
        }
      }
    });
  });
  return playerMobility - opponentMobility;
}

export function evaluateMobility(game: Chess, color: string): number {
  // https://www.chessprogramming.org/Evaluation#General_Aspects

  // game.turn == color
  const legalMovesMap: { [key: string]: number } = {};
  let newPosVal = 0;
  let defenseValue = 0;
  let fen = game.fen();

  // More simple approach
  // How many squares are we attacking?
  // If enemy on the
  // How many of our squares are attacked?

  game.moves({ verbose: true }).forEach((move) => {
    // value[move.piece] * PSQT(move.to)
    newPosVal += valueOfNewPos(move, move.color, fen);
    if (move.captured) {
      // Value of enemy * PSQT(enemy) + Value of piece * PSQT(move.to) - Value of piece * PSQT(move.from)
      newPosVal += valueOfSquare(move.captured, move.to, move.color, fen);
    }

    // Save all squares we can move to with a legal move
    legalMovesMap[move.to] = legalMovesMap[move.to]
      ? legalMovesMap[move.to]++
      : 1;
  });

  let attackingSqaures;

  game.board().forEach((row) => {
    row.forEach((square) => {
      // We control the square
      if (square?.type && color === square?.color) {
        // We also attack the square, and it is not a legal move
        if (
          game.isAttacked(square.square, color) &&
          !legalMovesMap[square.square]
        ) {
          defenseValue += valueOfSquare(square.type, square.square, color, fen);
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
  let fen = game.fen();
  game.board().forEach((row) => {
    row.forEach((square) => {
      if (square && square.color == player) {
        playerScore += valueOfSquare(
          square.type,
          square.square,
          square.color,
          fen
        );
        playerCount++;
      } else if (square) {
        opponentScore -= valueOfSquare(
          square.type,
          square.square,
          square.color,
          fen
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
