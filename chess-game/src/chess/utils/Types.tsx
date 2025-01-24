export enum Player {
  White = "w",
  Black = "b",
}

export enum stateBias {
  castled = 50,
  inCheck = 100,
  checkMate = 1000,
  draw = 0,
}
