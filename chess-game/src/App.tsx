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

  useEffect(() => {
    setGameFEN(game.fen());
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
    if (game.isGameOver() || game.isDraw())
      return;

    
    safeGameMutate((game) => {
      const randomMoves = game.moves();
      if(randomMoves.length == 0) return;

      const randomIndex = Math.floor(Math.random() * randomMoves.length); 
      game.move(randomMoves[randomIndex]);
      fenToBoardRepresenation(game.fen());
    });
  }

  // Function to handle piece drop by the user
  function onDrop(source: Square, target: Square): boolean {
    let move: Move | null = null;
    safeGameMutate((game) => {
      move = game.move({ from: source, to: target, promotion: "q" } as Move);
    });

    if (move === null) return false; // Illegal move

    setTimeout(() => {
      makeRandomMove();
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
