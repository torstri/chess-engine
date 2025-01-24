export enum Player {
  White = "w",
  Black = "b",
}

export enum stateBias {
  castled = 50,
  inCheck = 50,
  checkMate = 200,
  draw = 100,
}
