import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { fenToBoardRepresenation, mcts } from "./chessAI";
import { Node } from "./Node";
import { State } from "./State";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import "../CSS/Game.css";
import { ButtonGroup } from "@mui/material";

function AIvsAI(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());

  function playNextMove() {
    if (game.isGameOver()) {
      console.log("Game Over");
      return;
    }
    const newRoot = new Node(new State(game.fen()), game.turn(), 0);
    newRoot.nodeExpansion();
    newRoot.visits++;

    if (game.turn() === "w") {
      const result = mcts(newRoot);
      if (result.move) {
        try {
          console.log("Making mcts move", result.move);
          game.move({
            from: result.move.from,
            to: result.move.to,
            promotion: "q",
          });
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      var possibleMoves = game.moves();
      var randomIdx = Math.floor(Math.random() * possibleMoves.length);
      console.log("Making random move: ", possibleMoves[randomIdx]);
      game.move(possibleMoves[randomIdx]);
    }
    setGameFEN(game.fen());

    setTimeout(playNextMove, 300); // Add delay for realism
  }

  return (
    <div className="container">
      <div>Current FEN string: {gameFEN}</div>
      <Chessboard position={gameFEN} />
      <div className="home-button">
        <ButtonGroup>
          <Button
            sx={{ color: "black" }}
            variant="outlined"
            onClick={playNextMove}
          >
            Start
          </Button>
          <Link href="/" underline="none" color="black">
            <Button sx={{ color: "black" }} variant="outlined">
              Home
            </Button>
          </Link>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default AIvsAI;
