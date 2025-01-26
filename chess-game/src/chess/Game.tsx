import { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { ChessAI } from "./chessAI";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "../CSS/Game.css";
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
  const [selectedVersion, setSelectedVersion] = useState<string>("1");
  const [isWhite, setIsWhite] = useState<boolean>(true);
  const [thinkTime, setThinkTime] = useState<number | string>(1);

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
      return new ChessAI(game, "b", 200);
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
      return new ChessAI(game, "b", 200);
    });
  }
  function runTests() {
    let testGame = new Chess();

    let fen_start_position =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    testGame.load(fen_start_position);
    let testAIWhite = new ChessAI(testGame, "w", 200);
    let testAIBlack = new ChessAI(testGame, "b", 200);

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
    testAIWhite = new ChessAI(mate_in_1, "w", 200);
    console.log("Test: ", testAIWhite.makeMove(mate_in_1));
  }

  const handleVersionSelect = (event: SelectChangeEvent) => {
    setSelectedVersion(event.target.value as string);
    console.log("Selected version: ", event.target.value);
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
    console.log("Selected version: ", selectedVersion);
    console.log("Selected color: ", isWhite ? "White" : "Black");
    console.log("Thinking time: ", thinkTime);
  }

  return (
    <Grid2 container spacing={2} sx={{ padding: "20px" }}>
      {/* First Grid Column with Input Form */}
      <Grid2 size={4}>
        <Grid2 container direction="column" spacing={2}>
          {/* Select AI Version */}
          <Grid2>
            <FormControl fullWidth>
              <InputLabel id="version-select-label">
                Select an AI version
              </InputLabel>
              <Select
                labelId="version-select-label"
                value={selectedVersion}
                label="Select an AI version"
                onChange={handleVersionSelect}
              >
                <MenuItem value="1">Version: 1</MenuItem>
                <MenuItem value="2">Version: 2</MenuItem>
                <MenuItem value="3">Version: 3</MenuItem>
              </Select>
            </FormControl>
          </Grid2>

          {/* Play Color Button */}
          <Grid2>
            <Button
              onClick={handleColorClick}
              variant="outlined"
              sx={{
                backgroundColor: isWhite ? "white" : "black",
                color: isWhite ? "black" : "white",
                borderColor: "black",
                "&:hover": {
                  backgroundColor: isWhite ? "#f0f0f0" : "#333",
                },
              }}
            >
              {isWhite ? "Play as White" : "Play as Black"}
            </Button>
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

          {/* Run Tests Button */}
          <Grid2>
            <Button onClick={runTests}>Run Tests</Button>
          </Grid2>
        </Grid2>
      </Grid2>

      {/* Second Grid Column with Chessboard */}
      <Grid2 size={5}>
        <Chessboard position={gameFEN} onSquareClick={handleSquareClick} />
        <div> Current FEN: {game.fen()}</div>
        {chessBot?.root?.state && (
          <div>
            Evaluation ={" "}
            {chessBot.root?.state.totalScore / chessBot.root?.visits}
          </div>
        )}
      </Grid2>

      {/* Third Grid Column with Additional Buttons */}
      <Grid2 size={3}>
        <div className="button-group">
          <Button variant="outlined" disabled={loading} onClick={finishSetup}>
            Finish Setup
          </Button>
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
      </Grid2>
    </Grid2>
  );
}

export default Game;
