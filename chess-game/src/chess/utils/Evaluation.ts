import { Chess, Move, PieceSymbol, Color, Square } from "chess.js";
import { stateBias, Player } from "./Types";
import {
  pieceValue,
  MOBILITY_WEIGHT,
  MATERIAL_WEIGHT,
  MAX_EVALUATION,
  stringPieceValue,
  INITAL_MATERIAL_VALUE,
  END_GAME_MATERIAL_THRESHOLD,
  MAX_DEPTH_COMPENSATION,
} from "./Constants";
import { PSQT_MAP, getSquareInTable, PSQT } from "./PSQT";

export function getCurrentPieceValue(fen: string): number {
  const boardState = fen.split(" ")[0];

  const currentPieceValue = boardState.split("").reduce((total, char) => {
    const piece = char.toLowerCase();
    if (pieceValue.hasOwnProperty(piece)) {
      return total + stringPieceValue[piece];
    }
    return total;
  }, 0);
  return currentPieceValue;
}

export function isEndGame(fen: string): boolean {
  const currentPieceValue = getCurrentPieceValue(fen);
  const materialPercentage = currentPieceValue / INITAL_MATERIAL_VALUE;

  return materialPercentage < END_GAME_MATERIAL_THRESHOLD;
}

export function getEndGameWeight(fen: string): number {
  const currentPieceValue = getCurrentPieceValue(fen);
  const materialPercentage = currentPieceValue / INITAL_MATERIAL_VALUE;

  return 1 - materialPercentage;
}

export function chebyshevDistance(
  sqaure1File: number,
  sqaure1Rank: number,
  sqaure2File: number,
  sqaure2Rank: number
) {
  if (
    [sqaure1File, sqaure1Rank, sqaure2File, sqaure2Rank].some(
      (val) => val < 0 || val > 7
    )
  ) {
    throw new Error("Recieved file or rank values outside of range 0-7");
  }
  return Math.max(
    Math.abs(sqaure1File - sqaure2File),
    Math.abs(sqaure1Rank - sqaure2Rank)
  );
}

export function evaluateKingPosition(game: Chess, player: Color) {
  let opponentKingSquare: Square | null = null;
  let playerKingSquare: Square | null = null;

  game.board().forEach((row) => {
    row.forEach((square) => {
      if (square?.type === "k") {
        if (square.color === player) {
          playerKingSquare = square.square;
          if (opponentKingSquare) {
            return;
          }
        } else {
          opponentKingSquare = square.square;
          if (playerKingSquare) {
            return;
          }
        }
      }
    });
  });

  const toCoords = (square: Square) => {
    let file = square.charCodeAt(0) - "a".charCodeAt(0);
    let rank = parseInt(square[1]) - 1;
    return { file, rank };
  };

  if (!opponentKingSquare || !playerKingSquare) {
    console.error("King positions were not found");
    return null;
  }
  let opponentKingPos = toCoords(opponentKingSquare);
  let playerKingPos = toCoords(playerKingSquare);

  // https://en.wikipedia.org/wiki/Chebyshev_distance

  const centerSquares = [
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ];

  // Shortest distance between opponent king and center squares
  const opponentKingDistToCentre = Math.min(
    ...centerSquares.map(([file, rank]) =>
      chebyshevDistance(opponentKingPos.file, opponentKingPos.rank, file, rank)
    )
  );

  // Distance between kings
  const dstBetweenKings = chebyshevDistance(
    opponentKingPos.file,
    opponentKingPos.rank,
    playerKingPos.file,
    playerKingPos.rank
  );

  // Max distance between any two squares is 7
  let evaluation = opponentKingDistToCentre + 7 - dstBetweenKings;
  const fen = game.fen();

  return evaluation * 10 * getEndGameWeight(fen);
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
        ? pieceValue[move.captured]
        : pieceValue[move.captured];

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
  } else {
    outCome = stateBias.draw;
  }

  return outCome / depthCompensation;
}

export function evaluateState(game: Chess, player: Color): number {
  const mobilityScore = mobilityEvaluation(game, player);
  const materialScore = materialEvaluation(game, player);
  const kingScore = evaluateKingPosition(game, player) ?? 0;

  return (
    MATERIAL_WEIGHT * materialScore +
    mobilityScore * MOBILITY_WEIGHT +
    kingScore * 3
  );
}

export function clampEvaluation(value: number): number {
  return Math.min(MAX_EVALUATION, Math.max(-MAX_EVALUATION, value));
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

export function mobilityEvaluation(game: Chess, player: Color): number {
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
