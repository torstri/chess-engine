export enum Player {
  White = "w",
  Black = "b",
}

export enum stateBias {
  castled = 50,
  inCheck = 100,
  checkMate = 2000,
  draw = 0,
}
