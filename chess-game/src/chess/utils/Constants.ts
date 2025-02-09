export const C = 2;
export const MAXDEPTH = 5;

export const duration = 500;
export const ALLOWED_DURATION = 500;
export const TOTAL_PIECE_VALUE = 39;
export const pieceValue = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 100,
  "": 0,
};
export const END_GAME_PIECE_AMOUNT = 20; // Completely arbitrary

export const MOBILITY_WEIGHT = 0.5;
export const MATERIAL_WEIGHT = 2;

export const EVAL_LIMIT: number = pieceValue['q'] * 2;
