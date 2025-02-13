import { Chess, Move, PieceSymbol, validateFen, Color } from "chess.js";
import { stateBias, Player } from "./Types";
import {
  pieceValue,
  END_GAME_PIECE_AMOUNT,
  MOBILITY_WEIGHT,
  MATERIAL_WEIGHT,
  MAX_EVALUATION,
  stringPieceValue,
  INITAL_MATERIAL_VALUE,
  END_GAME_MATERIAL_THRESHOLD,
  MAX_DEPTH_COMPENSATION,
} from "./Constants";
import { PSQT_MAP, getSquareInTable, PSQT } from "./PSQT";

export function isEndGame(fen: string): boolean {
  const boardState = fen.split(" ")[0];

  // Calculate the total value of the pieces on the board
  const currentPieceValue = boardState.split("").reduce((total, char) => {
    const piece = char.toLowerCase(); // Convert char to lowercase
    if (pieceValue.hasOwnProperty(piece)) {
      return total + stringPieceValue[piece]; // Add the piece value to the total
    }
    return total; // Return total if no matching piece value
  }, 0);

  const materialPercentage = currentPieceValue / INITAL_MATERIAL_VALUE;

  return materialPercentage < END_GAME_MATERIAL_THRESHOLD; // Return true if the total value is below the threshold
}

export function evaluateMove(
  game: Chess,
  move: Move,
  player: Color,
  depth: number
): number {
  if (game.isGameOver()) {
    return evaluateTerminalState(game, player, depth);
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

export function evaluateTerminalState(
  game: Chess,
  player: Color,
  depth: number
): number {
  let outCome;

  const depthCompensation = Math.min(
    MAX_DEPTH_COMPENSATION,
    Math.max(1, depth)
  );
  if (game.isCheckmate()) {
    outCome =
      game.turn() === player ? -stateBias.checkMate : stateBias.checkMate;
    console.log(
      "Found checkmate!! Evaluated to: ",
      outCome / depthCompensation
    );
  } else {
    outCome = stateBias.draw;
  }

  return outCome / depthCompensation;
}

export function evaluateState(game: Chess, player: Color): number {
  const mobilityScore = newMobilityEvaluation(game, player);
  const materialScore = materialEvaluation(game, player);

  return MATERIAL_WEIGHT * materialScore + mobilityScore * MOBILITY_WEIGHT;
}

export function clampEvaluation(value: number): number {
  return Math.min(MAX_EVALUATION, Math.max(-MAX_EVALUATION, value));
}

export function mobiltyEvaluation(
  game: Chess,
  player: Color,
  opponent: Color
): number {
  // https://www.chessprogramming.org/Evaluation#General_Aspects
  let playerMobility = 0;
  let opponentMobility = 0;

  let gameFen = game.fen();
  let fenParts = gameFen.split(" ");
  let color = game.turn() === player ? player : opponent;
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

export function valueOfNewPos(move: Move, color: Color, fen: string): number {
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
  color: Color,
  fen: string
): number {
  const tableIndex = getSquareInTable(square, color);
  let psqt = PSQT_MAP[piece];

  if (piece === "p" && isEndGame(fen)) {
    psqt = PSQT.PAWN_ENDGAME;
  }

  if (piece === "k" && isEndGame(fen)) {
    psqt = PSQT.KING_ENDGAME;
  }

  return psqt
    ? pieceValue[piece] + psqt[tableIndex.rowIdx][tableIndex.colIdx]
    : 0;
}

export function newMobilityEvaluation(game: Chess, player: Color): number {
  let fen = game.fen();

  let playerMobility = 0;
  let opponentMobility = 0;

  let opponent: Color = player === Player.White ? Player.Black : Player.White;

  game.board().forEach((row) => {
    row.forEach((square) => {
      // If we have square object, the square is occupied
      if (square) {
        let isAttackedByPlayer = game.isAttacked(square.square, player);
        let isAttackedByOpponent = game.isAttacked(square.square, opponent);
        if (isAttackedByPlayer && !isAttackedByOpponent) {
          // occupied by opponent
          playerMobility += valueOfSquare(
            square.type,
            square.square,
            square.color === player ? player : opponent,
            fen
          );
        } else if (!isAttackedByPlayer && isAttackedByOpponent) {
          // Occupied by player
          opponentMobility += valueOfSquare(
            square.type,
            square.square,
            square.color === player ? player : opponent,
            fen
          );
        }
      }
    });
  });

  return playerMobility - opponentMobility;
}

export function evaluateMobility(game: Chess, color: Color): number {
  // https://www.chessprogramming.org/Evaluation#General_Aspects

  const legalMovesMap: { [key: string]: number } = {};
  let newPosVal = 0;
  let defenseValue = 0;
  let fen = game.fen();

  // More simple approach
  // How many squares are we attacking?
  // If enemy on the
  // How many of our squares are attacked?

  game.moves({ verbose: true }).forEach((move) => {
    newPosVal += valueOfNewPos(move, move.color, fen);
    if (move.captured) {
      newPosVal += valueOfSquare(move.captured, move.to, move.color, fen);
    }

    // Save all squares we can move to with a legal move
    legalMovesMap[move.to] = legalMovesMap[move.to]
      ? legalMovesMap[move.to]++
      : 1;
  });

  game.board().forEach((row) => {
    row.forEach((square) => {
      // We control the square
      if (
        square?.type &&
        color === square?.color &&
        game.isAttacked(square.square, color) &&
        !legalMovesMap[square.square]
      ) {
        // We also attack the square, and it is not a legal move
        defenseValue += valueOfSquare(square.type, square.square, color, fen);
      }
    });
  });

  return newPosVal + defenseValue;
}

export function materialEvaluation(game: Chess, player: Color): number {
  let fen = game.fen();
  let materialScore = 0;

  game.board().forEach((row) => {
    row.forEach((square) => {
      if (square) {
        const score = valueOfSquare(
          square.type,
          square.square,
          square.color,
          fen
        );
        materialScore += square.color === player ? score : -score;
      }
    });
  });

  return materialScore;
}
