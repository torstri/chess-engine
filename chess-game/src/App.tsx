import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { fenToBoardRepresenation } from "./engine/Engine";
import "./App.css";

// Define the type for the modify function used in safeGameMutate
type ModifyFunction = (game: Chess) => void;

function App(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [possibleMoves, setPossibleMoves] = useState<string[]>(game.moves());

  useEffect(() => {
    setGameFEN(game.fen());
    setPossibleMoves(game.moves());
  }, [game]);

  // Function to safely mutate the game state
  function safeGameMutate(modify: ModifyFunction): void {
    setGame((g) => {
      const update = new Chess(g.fen()); // Create a new Chess instance with the current position
      modify(update);
      return update;
    });
  }

  // Function to make a random move for the computer
  function makeRandomMove(): void {
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0)
      return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length); // Pick a random move from possible moves
    const randomMove = possibleMoves[randomIndex];

    safeGameMutate((game) => {
      game.move(game.moves()[0]); // Apply the move
      fenToBoardRepresenation(game.fen());
      console.log("Lastly: ", game);
    });
  }

  // Function to handle piece drop by the user
  function onDrop(source: Square, target: Square): boolean {
    let move: Move | null = null;
    safeGameMutate((game) => {
      move = game.move({ from: source, to: target, promotion: "q" } as Move);
    });

    if (move === null) return false; // Illegal move

    // setGameFEN(game.fen()); // Update the FEN after a valid move
    setTimeout(() => {
      makeRandomMove(); // Make a random move after a valid move
    }, 200);

    return true; // Valid move
  }

  return (
    <div className="container">
      <div>Current FEN string: {gameFEN}</div>
      <Chessboard position={game.fen()} onPieceDrop={onDrop} />
    </div>
  );
}

export default App;
