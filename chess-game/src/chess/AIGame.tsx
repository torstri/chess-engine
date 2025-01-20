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
  const [turn, setTurn] = useState<boolean>(false);  // white: true, black: false
  const [pause, setPause] = useState<boolean>(false);

  useEffect(() => {
    setWhiteBot(() => {
      return new ChessAI(game, 'w');
    });

    setBlackBot(() => {
      return new ChessAI(game, 'b');
    });

  }, []);

  useEffect(() => {

    if(start && !pause) {
      if(turn) {
        if(!playNextMove) setStart(false);
      } else {
        if(!playRandomMove()) setStart(false);
      }

      setGameFEN(game.fen());
      
      setTimeout(() => {
        setTurn(!turn);
      }, 200);
    }

  }, [turn, pause]);
 

  function playNextMove(): boolean {

    if (game.isGameOver()) {
      console.log("Game Over");
      return false;
    }

    const move = turn ? whiteBot?.makeMove(game) : blackBot?.makeMove(game);

    try {
      game.move({
        from: move?.from,
        to: move?.to,
        promotion: move?.promotion,
      } as Move);
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }

  function playRandomMove(): boolean {
    var possibleMoves = game.moves({verbose: true});
    var randomIdx = Math.floor(Math.random() * possibleMoves.length);
    const randMove = possibleMoves[randomIdx];

    try {
      game.move({
        from: randMove.from,
        to: randMove.to,
        promotion: randMove.promotion,
      } as Move);
    } catch(e) {
      console.error(e);
      return false;
    }

    return true;
  }

  function startGame() {
    setStart(true);
    setPause(false);
    setTurn(!turn);
  }

  function pauseGame() {
    setStart(!start);
    setPause(!pause);
    setTurn(!turn);
  }

  function restartGame() {
    setStart(false);
    setPause(false);
    
    game.reset();
    setGame(game);
    setGameFEN(game.fen());

    setWhiteBot(() => {
      return new ChessAI(game, 'w');
    });

    setBlackBot(() => {
      return new ChessAI(game, 'b');
    });
  }

  return (
    <div className="container">
      <Chessboard position={gameFEN} />
      <div className="button-group">
        {
          !start ? 
            <Button
              onClick={startGame}
              variant="outlined"
            >
              Start
            </Button>
          : <Button variant="outlined" onClick={pauseGame}>Pause</Button>
        }
          <Button variant="outlined" onClick={() => {navigate("/")}}>
              Home
            </Button>
          <Button variant="outlined" onClick={restartGame}>Restart</Button>
        </div>
    </div>
  );
}

export default AIvsAI;
