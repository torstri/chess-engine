import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { ChessAI } from "./chessAI";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "../CSS/Game.css";

// Define the type for the modify function used in safeGameMutate
type ModifyFunction = (game: Chess) => void;

function Game(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [selectedPiece, setSelectedPiece] = useState<string>();
  const [selectedSquare, setSelectedSquare] = useState<Square | undefined>(
    undefined
  );
  const [sourceSelected, setSrcSelected] = useState<boolean>();
  const [m, setMove] = useState<Move | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [chessBot, setChessBot] = useState<ChessAI>();

  useEffect(() => {
    setGameFEN(game.fen());
  }, [game]);

  useEffect(() => {
    if (sourceSelected && m != undefined) {
      setSelectedSquare(undefined);
      setSelectedPiece(undefined);
      setSrcSelected(false);

      setTimeout(computeMove, 200);
    }
  }, [m]);

  useEffect(() => {
    setChessBot(() => {
      return new ChessAI(game, "b");
    });
  }, []);

  function computeMove(): boolean {
    if (game.isGameOver()) {
      console.log("Game Over");
      setLoading(false);
      return false;
    }

    const move = chessBot?.makeMove(game);

    if (move) {
      safeGameMutate((game) => {
        try {
          game.move({
            from: move.from,
            to: move.to,
            promotion: "q",
          } as Move);
        } catch (e) {
          console.error(e);
          return false;
        }
      });
    } else {
      throw new Error("No move found");
    }

    setTimeout(() => {}, 200);

    setGameFEN(game.fen());

    setLoading(false);

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

  function handleSquareClick(square: Square, piece?: string): void {
    if (sourceSelected) {
      setLoading(true);
      safeGameMutate((game) => {
        try {
          setMove(
            game.move({
              from: selectedSquare,
              to: square,
              promotion: "q",
            } as Move)
          );
        } catch (e) {
          console.error(e);
          setSelectedSquare(undefined);
          setSelectedPiece(undefined);
          setSrcSelected(false);
          return;
        }
      });
    } else if (piece != undefined) {
      setSelectedSquare(square);
      setSelectedPiece(piece);
      setSrcSelected(true);
    }
  }

  function resetGame() {
    setSelectedSquare(undefined);
    setSelectedPiece(undefined);
    setSrcSelected(false);

    game.reset();
    setGame(game);
    setGameFEN(game.fen());

    setChessBot(() => {
      return new ChessAI(game, "b");
    });
  }
  function runTests() {
    let testGame = new Chess();

    let fen_start_position =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    testGame.load(fen_start_position);
    let testAIWhite = new ChessAI(testGame, "w");
    let testAIBlack = new ChessAI(testGame, "b");

    let fen_mate_in_1_white = "7k/5ppp/8/8/8/8/5PPP/3R3K w - - 0 1";
    testGame.load(fen_mate_in_1_white);
    let fen_mate_in_1_black = "4r2k/5ppp/8/8/8/8/5PPP/7K b - - 0 1";
    console.log("------------------------Tests----------------------");
    console.log(
      "Start position, White: ",
      testAIWhite.getEvalution(new Chess(fen_start_position)),
      " and Black: ",
      testAIBlack.getEvalution(new Chess(fen_start_position))
    );

    console.log(
      "Mate in 1 for white, Evaluation by White: ",
      testAIWhite.getEvalution(new Chess(fen_mate_in_1_white)),
      " and Black: ",
      testAIBlack.getEvalution(new Chess(fen_mate_in_1_white))
    );

    console.log(
      "Mate in 1 for black, Evaluation by White: ",
      testAIWhite.getEvalution(new Chess(fen_mate_in_1_black)),
      " and Black: ",
      testAIBlack.getEvalution(new Chess(fen_mate_in_1_black))
    );
    console.log("------------------------End Tests----------------------");

    let mate_in_1 = new Chess("3R2rk/5ppp/8/8/3Q4/6RP/5PP1/7K w - - 0 1");
    testAIWhite = new ChessAI(mate_in_1, "w");
    console.log("Test: ", testAIWhite.makeMove(mate_in_1));
  }
  return (
    <div className="container">
      <Chessboard position={gameFEN} onSquareClick={handleSquareClick} />
      <div className="button-group">
        <Button variant="outlined" disabled={loading} onClick={resetGame}>
          Restart
        </Button>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </Button>
      </div>
      <div>{game.fen()}</div>
      {chessBot?.root?.state && (
        <div>
          Evaluation = {chessBot.root?.state.totalScore / chessBot.root?.visits}
        </div>
      )}
      <Button onClick={runTests}>Run Tests</Button>
    </div>
  );
}

export default Game;
