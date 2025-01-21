import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ChessAI } from "./chessAI";
import Button from "@mui/material/Button";
import { useNavigate } from 'react-router-dom';
import "../CSS/AIGame.css";


function AIGame(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [whiteBot, setWhiteBot] = useState<ChessAI>();
  const [blackBot, setBlackBot] = useState<ChessAI>();
  const [start, setStart] = useState<boolean>(false);
  const [turn, setTurn] = useState<boolean>(false);  // white: true, black: false
  const [pause, setPause] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {

    setWhiteBot(() => {
      return new ChessAI(game, 'w');
    });

    setBlackBot(() => {
      return new ChessAI(game, 'b');
    });

  }, []);

  useEffect(() => {

    if (start && !pause) {

      if (turn) {
        const success = playNextMove();
        if (!success) setStart(false);
        else setGameFEN(game.fen());
      } else {
        const success = playRandomMove();
        if (!success) setStart(false);
        else setGameFEN(game.fen());
      }

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
    return moveUpdate(move);
  }

  function playRandomMove(): boolean {

    if (game.isGameOver()) {
      console.log("Game Over");
      return false;
    }

    var possibleMoves = game.moves({verbose: true});
    var randomIdx = Math.floor(Math.random() * possibleMoves.length);
    const randMove = possibleMoves[randomIdx];
    return moveUpdate(randMove);
  }

  function moveUpdate(move?: Move): boolean {
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

  function togglePlay(start: boolean, pause: boolean, turn: boolean) {
    setStart(start);
    setPause(pause);
    setTurn(turn);
  }

  function resetGame() {
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
              onClick={() => { togglePlay(true, false, !turn) }}
              variant="outlined"
            >
              Start
            </Button>
          : <Button variant="outlined" onClick={() => { togglePlay(!start, !pause, !turn) }}>Pause</Button>
        }
          <Button variant="outlined" onClick={() => {navigate("/")}}>
              Home
            </Button>
          <Button variant="outlined" onClick={resetGame}>Reset</Button>
        </div>
    </div>
  );
}

export default AIGame;
