export enum Player {
  White = "w",
  Black = "b",
}

export enum stateBias {
  castled = 100,
  inCheck = 200,
  checkMate = 28000,
  draw = 0,
}
