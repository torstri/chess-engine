# chess-engine

## Commands
### Install Dependencies
Before running the project, ensure all dependencies are installed. Run the following command in the root directory of the project:
```
npm install
```

### Run the Development Server
```
npm run dev
```

### Jest
Run the following command to run all tests
```
npm test
```

## Evaluation of Game State

```Typescript
export function newMobilityEvaluation(game: Chess, player: Color): number {
````
````
For a given square we have the following properties:
  Occupation: which color occupies the square -> player | opponent | null
  AttackedBy: which color attacks the square -> player | opponent | p & o | null
  Therefore we have 12 dfferent possibilities (?)

  SINCE WE DO NOT KNOW WHICH PIECE IS ATTACKING A SQUARE
  WE IGNORE THE CASE WHERE THE SQUARE IS UNOCCUPIED
  BOTH COLORS ATTACK THE SQUARE

  We want to determine the difference in our attacking and attacked status
  So perhaps it will be like this:
  Iterate over each square
  Only consder sqaures which are only attacked by one color
  Then we have four possibilities:
  Occupancy -> player | opponent | null
  Attacker -> player | opponent
  However, .board represents empty squares as null so we do not know which
  square that is :( so we need to ignore unoccupied squares
  ````
```
 Right now this probably favours aggressive players;
 returns number of squares we defend + number of squares we attack
```
```Typescript
  export function evaluateMobility(game: Chess, player: string, color: string): number {
```
    To evaluate mobility we consider two things:
    1. Squares we attack and 2. squares we defend

    1. Squares we attack we can find through game.moves ezpz
    2. Squares we defend is trickier so we iterate over all squares
    If we are attacking the square, but it is not included in game.moves()
    -> we are occupying it i.e. we are defending it

    Lastly, game.moves() only works if param color is the one to move
    so we change the game if we are not the one to move

    Map to store all squares we are attacking
```Typescript
    const attackedSquaresMap: { [key: string]: number } = {};
    let attackedSquares = 0; // Keeps track of our legal moves
```
```
   If the passed color is not the one to move we need to change the game
   in order to utilize game.move()
```
```Typescript
    if (game.turn() !== player) {
     FEN: "row/row/row/row/row/row/row/row ActiveColor CastlingRights EnPassantTargetSquare Half-MoveClock Full-MoveClock"
      let gameFen = game.fen();
      let fenParts = gameFen.split(" ");

     Switch turn in the FEN (index 1 contains turn)
      fenParts[1] = color; // Set the turn to the desired color

     Construct new FEN
      let newFen = fenParts.join(" ");

     Create a new instance of the game to avoid mutating the original
      let newGame = new Chess();

      try {
        newGame.load(newFen);
      } catch (error) {
        newGame = game;
        const randomIndex = Math.floor(Math.random() * game.moves().length);
        const randomMove = newGame.moves()[randomIndex];
        newGame.move(randomMove);
      }

    //  We check all of the moves possible
    //  We use verbose since this returns
    //  piece, from and to, and we want to see which square we are attacking

      newGame.moves({ verbose: true }).forEach((move) => {
        attackedSquaresMap[move.to] = attackedSquaresMap[move.to]
          ? 1
          : attackedSquaresMap[move.to] + 1;
        attackedSquares++;
      });
    } else {
      game.moves({ verbose: true }).forEach((move) => {
        attackedSquaresMap[move.to] = attackedSquaresMap[move.to]
          ? 1
          : attackedSquaresMap[move.to] + 1;
        attackedSquares++;
      });
    }
```
```
   THIS MIGHT BE INCORRECT:
   game.isAttacked(square, color) returns true even if we are pinned
   if we are pinned then it will not be a legal move
   this could be checked with a try catch block
   since game.move(pinned_piece) will throw an exception
   Iterate over all squares
   If we are attacking a square but it is not one of our legal moves,
   then we are defending the piece
   Sum these up:
```
```Typescript
    let defendedSquares = 0;
    game.board().forEach((row) => {
      row.forEach((square) => {
        if (square?.square && color === square.color) {
          if (!attackedSquaresMap[square.square]) {
           I do not know if we can do like this
            defendedSquares += game.isAttacked(square.square, square.color)
              ? 1 * pieceValue[square.type]
              : 0;
          }
        }
      });
    });

    return defendedSquares + attackedSquares;
  }
  ```