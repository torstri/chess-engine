import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ChessAI } from "./chessAI";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "../CSS/AIGame.css";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

enum Player {
  White = "w",
  Black = "b",
}

function AIGame(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [whiteBot, setWhiteBot] = useState<ChessAI>();
  const [blackBot, setBlackBot] = useState<ChessAI>();
  const [start, setStart] = useState<boolean>(false);
  const [turn, setTurn] = useState<boolean>(false); // white: true, black: false
  const [pause, setPause] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [numberOfGames, setNumberOfGames] = useState<number>(1);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [whiteWins, setwhiteWins] = useState<number>(0);
  const [blackWins, setBlackWins] = useState<number>(0);
  const [draws, setDraws] = useState<number>(0);
  const navigate = useNavigate();
  const turnDuration = 20;

  useEffect(() => {
    setWhiteBot(() => {
      return new ChessAI(game, "w");
    });

    setBlackBot(() => {
      return new ChessAI(game, "b");
    });
  }, []);

  useEffect(() => {
    if (start && !pause) {
      const playMove = async () => {
        const success = turn ? playNextMove() : playRandomMove();
        if (!success) {
          setStart(false);
        } else {
          setGameFEN(game.fen());
          setTurn((prevTurn) => !prevTurn); // Toggle turn safely
        }
      };
      const timerId = setTimeout(playMove, turnDuration);
      return () => clearTimeout(timerId); // Cleanup the timer
    }
  }, [turn, pause, start, gameFEN]); // Add relevant dependencies

  useEffect(() => {
    console.log("In game over use effect");
    if (gameOver) {
      updateScoreBoard();
      setGamesPlayed((gp) => {
        if (gp + 1 < numberOfGames) {
          setGameOver(false);
          resetGame();
          togglePlay(true, false, true);
          return gp + 1;
        }
        return 0;
      });
      setGameOver(false);
    }
  }, [gameOver]);

  function updateScoreBoard() {
    if (game.isDraw()) {
      console.log("Draw!");
      setDraws(draws + 1);
    }

    if (game.isCheckmate() && game.turn() == Player.White) {
      console.log("Black win!");

      setBlackWins(blackWins + 1);
    } else if (game.isCheckmate()) {
      console.log("White win!");

      setwhiteWins(whiteWins + 1);
    }
  }

  function playNextMove(): boolean {
    if (game.isGameOver()) {
      console.log("Game Over");
      setGameOver(false);
      return false;
    }

    try {
      const move = turn ? whiteBot?.makeMove(game) : blackBot?.makeMove(game);
      // console.log(move);
      return moveUpdate(move);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function playRandomMove(): boolean {
    if (game.isGameOver()) {
      console.log("Game Over");
      setGameOver(true);
      return false;
    }

    var possibleMoves = game.moves({ verbose: true });
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
    const newGame = new Chess(); // Create a fresh game instance
    setGame(newGame);
    setGameFEN(newGame.fen());
    setWhiteBot(() => new ChessAI(newGame, "w"));
    setBlackBot(() => new ChessAI(newGame, "b"));
  }

  return (
    <div className="container">
      <Chessboard position={gameFEN} />
      <div className="button-group">
        {!start ? (
          <Button
            onClick={() => {
              togglePlay(true, false, !turn);
            }}
            variant="outlined"
          >
            Start
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => {
              togglePlay(!start, !pause, !turn);
            }}
          >
            Pause
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </Button>
        <Button variant="outlined" onClick={resetGame}>
          Reset
        </Button>
      </div>
      <div>
        <label htmlFor="gameInput">Number of Games: </label>
        <input
          id="gameInput"
          type="number"
          value={numberOfGames}
          onChange={(e) => {
            setNumberOfGames(Number(e.target.value));
          }}
          min="0"
        />
      </div>
      <div>SCORE BOARD</div>
      <TableContainer component={Paper} sx={{ width: "800px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Wins</TableCell>
              <TableCell align="right">Draws</TableCell>
              <TableCell align="right">Losses</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>White</TableCell>
              <TableCell align="right">{whiteWins}</TableCell>
              <TableCell align="right">{draws}</TableCell>
              <TableCell align="right">{blackWins}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Black</TableCell>
              <TableCell align="right">{blackWins}</TableCell>
              <TableCell align="right">{draws}</TableCell>
              <TableCell align="right">{whiteWins}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default AIGame;
