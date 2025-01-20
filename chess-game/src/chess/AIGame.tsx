import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ChessAI } from "./chessAI";
import Button from "@mui/material/Button";
import { useNavigate } from 'react-router-dom';
import "../CSS/AIGame.css";
import { BackdropProps } from "@mui/material";


function AIvsAI(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const navigate = useNavigate();
  const [whiteBot, setWhiteBot] = useState<ChessAI>();
  const [blackBot, setBlackBot] = useState<ChessAI>();
  const [start, setStart] = useState<boolean>(false);

  useEffect(() => {
    setWhiteBot(() => {
      return new ChessAI(game, 'w');
    });
  }, []);

  useEffect(() => {
    if(start) {
      playNextMove();
    }
  }, [start]);

  function playNextMove() {

    if (game.isGameOver()) {
      console.log("Game Over");
      return;
    }

    if (game.turn() === "w") {
      const move = whiteBot?.makeMove(game);
      if (move) {
        try {
          game.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          } as Move);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      var possibleMoves = game.moves({verbose: true});
      var randomIdx = Math.floor(Math.random() * possibleMoves.length);
      const randMove = possibleMoves[randomIdx];
      game.move({
        from: randMove.from,
        to: randMove.to,
        promotion: randMove.promotion,
      } as Move);
    }
    
    setGameFEN(game.fen());
    setGame(game);

    setTimeout(playNextMove, 200);
  }

  return (
    <div className="container">
      <div>Current FEN string: {gameFEN}</div>
      <Chessboard position={gameFEN} />
      <div className="button-group">
          <Button
            onClick={() => {setStart(true)}}
            disabled={start}
            variant="outlined"
          >
            Start
          </Button>
          <Button variant="outlined" onClick={() => {navigate("/")}}>
              Home
            </Button>
          <Button variant="outlined" onClick={() => { window.location.reload(); }}>Restart</Button>
        </div>
    </div>
  );
}

export default AIvsAI;
