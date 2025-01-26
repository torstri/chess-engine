import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ChessAI } from "./chessAI";
import { chessAI_v1 } from "../old-versions/chess-engine-1.0.0/chessAI_v1";
import { Player } from "./utils/Types";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "../CSS/AIGame.css";
import {
  Select,
  Grid2,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
} from "@mui/material";

function AIGame(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [whiteBot, setWhiteBot] = useState<any>();
  const [blackBot, setBlackBot] = useState<any>();
  const [start, setStart] = useState<boolean>(false);
  const [turn, setTurn] = useState<boolean>(false); // white: true, black: false
  const [pause, setPause] = useState<boolean>(false);
  const [numberOfGames, setNumberOfGames] = useState<number>(1);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [whiteWins, setwhiteWins] = useState<number>(0);
  const [blackWins, setBlackWins] = useState<number>(0);
  const [draws, setDraws] = useState<number>(0);

  const [turnCounter, setTurnCounter] = useState<number>(0);

  const [selectedWhiteVersion, setSelectedWhiteVersion] = useState<string>("1");
  const [selectedBlackVersion, setSelectedBlackVersion] = useState<string>("1");

  const [isWhite, setIsWhite] = useState<boolean>(true);
  const [thinkTime, setThinkTime] = useState<string>("1");

  const navigate = useNavigate();
  const turnDuration = 1;

  useEffect(() => {
    setWhiteBot(() => {
      return new chessAI_v1(game, Player.White, 200);
    });

    setBlackBot(() => {
      return new chessAI_v1(game, Player.Black, 200);
    });
  }, []);

  useEffect(() => {
    if (start && !pause) {
      const playMove = async () => {
        const success = playNextMove();
        if (!success) {
          setStart(false);
        }
      };
      const timerId = setTimeout(playMove, turnDuration);
      return () => clearTimeout(timerId);
    }
  }, [turn, pause, start, gameFEN]);

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

  function handleGameOver(): boolean {
    updateScoreBoard();
    setGamesPlayed((gp) => {
      if (gp + 1 < numberOfGames) {
        resetGame();
        togglePlay(true, false, true);
        return gp + 1;
      }
      return 0;
    });
    return false;
  }

  function playNextMove(): boolean {
    if (game.isGameOver()) {
      return handleGameOver();
    }

    try {
      const move =
        turnCounter % 2 == 0
          ? whiteBot?.makeMove(game)
          : blackBot?.makeMove(game);
      // console.log("Turn: ", turn);
      // console.log("Turn Counter: ", turnCounter);
      return moveUpdate(move);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function moveUpdate(move?: Move): boolean {
    try {
      game.move({
        from: move?.from,
        to: move?.to,
        promotion: move?.promotion,
      } as Move);
      setTurnCounter(turnCounter + 1);
    } catch (error) {
      console.log(error);
      return false;
    }

    setGameFEN(game.fen());

    return true;
  }

  function getWinRate(color: string): number {
    if (color == Player.White) {
      return Math.round((whiteWins / (whiteWins + blackWins + draws)) * 100);
    } else {
      return Math.round((blackWins / (whiteWins + blackWins + draws)) * 100);
    }
  }

  function togglePlay(start: boolean, pause: boolean, turn: boolean) {
    setStart(start);
    setPause(pause);
    setTurn(turn);
    setTurnCounter(0);
  }

  function resetGame() {
    setStart(false);
    setPause(false);
    const newGame = new Chess();
    setGame(newGame);
    setGameFEN(newGame.fen());
    setTurnCounter(0);
    // setWhiteBot(() => new ChessAI(newGame, "w"));
    // setBlackBot(() => new ChessAI(newGame, "b"));
    // setwhiteWins(0);
    // setDraws(0);
    // setBlackWins(0);
  }

  const handleWhiteVersionSelect = (event: SelectChangeEvent) => {
    setSelectedWhiteVersion(event.target.value as string);
    // console.log("Selected White Version: ", event.target.value);
  };
  const handleBlackVersionSelect = (event: SelectChangeEvent) => {
    setSelectedBlackVersion(event.target.value as string);
    // console.log("Selected Black Version: ", event.target.value);
  };

  const handleColorClick = () => {
    setIsWhite(!isWhite);
  };

  const handleThinkTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    // Ensure that the value is either an empty string or a positive integer
    if (value === "" || /^[0-9]+$/.test(value)) {
      setThinkTime(value);
    }
  };

  function finishSetup() {
    console.log("------------");
    console.log("Selected White Version: ", selectedWhiteVersion);
    console.log("Selected Black Version: ", selectedBlackVersion);

    console.log("Thinking time: ", thinkTime);
    console.log("-----------");

    const newGame = new Chess();
    setGame(newGame);
    setGameFEN(newGame.fen());
    let allowedThinkTime = parseInt(thinkTime);
    if (selectedWhiteVersion === "current") {
      setWhiteBot(() => {
        return new ChessAI(game, Player.White, allowedThinkTime);
      });
    } else if (selectedWhiteVersion === "1") {
      setWhiteBot(() => {
        return new chessAI_v1(game, Player.White, allowedThinkTime);
      });
    }

    if (selectedBlackVersion === "current") {
      setBlackBot(() => {
        return new ChessAI(game, Player.Black, allowedThinkTime);
      });
    } else if (selectedBlackVersion === "1") {
      setBlackBot(() => {
        return new chessAI_v1(game, Player.Black, allowedThinkTime);
      });
    }
  }

  return (
    <Grid2 container spacing={2} sx={{ padding: "20px" }}>
      <Grid2 size={6}>
        <Chessboard position={gameFEN} />
      </Grid2>
      <Grid2 size={6}>
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
          <Button variant="outlined" onClick={finishSetup}>
            Finish Setup
          </Button>
        </div>
        <Grid2 size={4}>
          <Grid2 container direction="column" spacing={2}>
            {/* Select AI Version */}
            <Grid2>
              <FormControl fullWidth>
                <InputLabel id="version-select-label">
                  Select an AI version for White
                </InputLabel>
                <Select
                  labelId="version-select-label"
                  value={selectedWhiteVersion}
                  label="Select an AI version"
                  onChange={handleWhiteVersionSelect}
                >
                  <MenuItem value="current">Version: Current</MenuItem>

                  <MenuItem value="1">Version: 1</MenuItem>
                  <MenuItem value="2">Version: 2</MenuItem>
                  <MenuItem value="3">Version: 3</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2>
              <FormControl fullWidth>
                <InputLabel id="version-select-label">
                  Select an AI version for Black
                </InputLabel>
                <Select
                  labelId="version-select-label"
                  value={selectedBlackVersion}
                  label="Select an AI version"
                  onChange={handleBlackVersionSelect}
                >
                  <MenuItem value="current">Version: Current</MenuItem>

                  <MenuItem value="1">Version: 1</MenuItem>
                  <MenuItem value="2">Version: 2</MenuItem>
                  <MenuItem value="3">Version: 3</MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            {/* Think Time Input */}
            <Grid2>
              <FormControl fullWidth>
                <TextField
                  id="think-time"
                  label="AI Think Time (ms)"
                  value={thinkTime}
                  onChange={handleThinkTimeChange}
                  variant="outlined"
                  type="text"
                  helperText="Set the time in milliseconds"
                />
              </FormControl>
            </Grid2>
            <Grid2>
              <FormControl fullWidth>
                <TextField
                  id="gameInput"
                  label="Number of games"
                  value={numberOfGames}
                  onChange={(e) => {
                    setNumberOfGames(Number(e.target.value));
                  }}
                  variant="outlined"
                  type="text"
                  helperText="Set the time in milliseconds"
                />
              </FormControl>
              {/* <div>
                <label htmlFor="gameInput">Number of Games: </label>
                <input
                  id="gameInput"
                  type="number"
                  value={numberOfGames}
                  disabled={start}
                  onChange={(e) => {
                    setNumberOfGames(Number(e.target.value));
                  }}
                  min="1"
                />
              </div> */}
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>

      <Grid2 size={12}>
        <span style={{ padding: "10px" }}>Games Played: {gamesPlayed}</span>
        <TableContainer component={Paper} sx={{ width: "800px" }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell align="right">Wins</TableCell>
                <TableCell align="right">Draws</TableCell>
                <TableCell align="right">Losses</TableCell>
                <TableCell align="right">Win Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>White</TableCell>
                <TableCell align="right">{whiteWins}</TableCell>
                <TableCell align="right">{draws}</TableCell>
                <TableCell align="right">{blackWins}</TableCell>
                <TableCell align="right">
                  {whiteWins + blackWins + draws != 0
                    ? getWinRate(Player.White)
                    : 0}
                  %
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Black</TableCell>
                <TableCell align="right">{blackWins}</TableCell>
                <TableCell align="right">{draws}</TableCell>
                <TableCell align="right">{whiteWins}</TableCell>
                <TableCell align="right">
                  {whiteWins + blackWins + draws != 0
                    ? getWinRate(Player.Black)
                    : 0}
                  %
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <div>
          White Evaluation ={" "}
          {whiteBot?.root?.state?.totalScore / whiteBot?.root?.visits}
        </div>
        <div>
          Black Evaluation ={" "}
          {blackBot?.root?.state?.totalScore / blackBot?.root?.visits}
        </div>
      </Grid2>
    </Grid2>
  );
}

export default AIGame;
