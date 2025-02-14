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
The program evaluates a game state based on four aspects:
1. Material difference
2. Positioning of pieces
3. Mobility of pieces
4. King positions

1. and 2. are calculated using PSTs and piece values.
``` typescript
export function materialEvaluation(game: Chess, player: Color): number
```
