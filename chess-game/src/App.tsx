import { useEffect, useState } from "react";
import { Chess, Move, Piece } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { fenToBoardRepresenation, mcts } from "./engine/Engine";
import { Node } from "./engine/Node";
import { State } from "./engine/State";
import "./App.css";

// Define the type for the modify function used in safeGameMutate
type ModifyFunction = (game: Chess) => void;

function App(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [possibleMoves, setPossibleMoves] = useState<string[]>(game.moves());
  const [selectedPiece, setSelectedPiece] = useState<string>();
  const [selectedSquare, setSelectedSquare] = useState<Square | undefined>(undefined);
  const [sourceSelected, setSrcSelected] = useState<boolean>();
  const [m, setMove] = useState<Move | undefined>(undefined);

  useEffect(() => {
    setGameFEN(game.fen());
  }, [game]);

  useEffect(() => {
    if(sourceSelected && (m != undefined)) {
      setSelectedSquare(undefined);
      setSelectedPiece(undefined);
      setSrcSelected(false);
      
      setTimeout(computeMove, 200);
    }
  }, [m])

  useEffect(() => {
    Node.setPlayer('b');  // set the AI opponent color
  }, [])


  function computeMove(): boolean {

    const root: Node = new Node(
      new State(game.fen()),
      game.turn(),
      0
    );
    root.nodeExpansion();
    root.visited();
    
    const move = mcts(root);

    if(move) {
      safeGameMutate((game) => {
        try {
          game.move(move);
        } catch(e) {
          console.error(e);
          return false;
        }
      });
      console.log("COMPUTED MOVE: ", move);
    } else {
      throw new Error("No move found");
    }

    return true;
  }

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
      try {
        move = game.move({ from: source, to: target, promotion: "q" } as Move);
      } catch(e) {
        console.error(e);
        return false;
      }
    });

    if (move === null) return false; // Illegal move

    setTimeout(computeMove, 200);

    return true; // Valid move
  }

  function handleSquareClick(square: Square, piece?: string): void {
    
    if(sourceSelected) {

      safeGameMutate((game) => {
        try {
          setMove(game.move({ from: selectedSquare, to: square, promotion: "q" } as Move));
        } catch(e) {
          console.error(e);
          setSelectedSquare(undefined);
          setSelectedPiece(undefined);
          setSrcSelected(false);
          return;
        }
      });
    } else if(piece != undefined) {
      setSelectedSquare(square);
      setSelectedPiece(piece);
      setSrcSelected(true);
    }

  }

  return (
    <div className="container">
      <div>Current FEN string: {gameFEN}</div>
      <Chessboard position={game.fen()} onPieceDrop={onDrop} onSquareClick={handleSquareClick}/>
    </div>
  );
}

export default App;