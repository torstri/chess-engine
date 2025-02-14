export const C = 2;
export const MAXDEPTH = 3;

export const MAX_DEPTH_COMPENSATION = 8;

export const duration = 500;
export const ALLOWED_DURATION = 500;
export const TOTAL_PIECE_VALUE = 39;
export const pieceValue = {
  p: 100,
  n: 300,
  b: 330,
  r: 500,
  q: 900,
  k: 100,
  "": 0,
};
export const stringPieceValue: { [key: string]: number } = {
  p: 100,
  n: 300,
  b: 330,
  r: 500,
  q: 900,
  k: 200,
  "": 0,
};

export const INITAL_MATERIAL_VALUE =
  2 *
  (8 * pieceValue.p +
    2 * (pieceValue.n + pieceValue.b + pieceValue.r) +
    pieceValue.k +
    pieceValue.q);

export const END_GAME_MATERIAL_THRESHOLD = 0.5;

export const END_GAME_PIECE_AMOUNT = 20; // Completely arbitrary

export const MAX_EVALUATION = pieceValue.q * 5;

export const MOBILITY_WEIGHT = 0.4;
export const MATERIAL_WEIGHT = 0.9;
