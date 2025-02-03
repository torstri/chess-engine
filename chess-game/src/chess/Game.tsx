import { useEffect, useState } from "react";
import { Chess, Color, Move } from "chess.js";
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
import { Player } from "./utils/Types";
import { chessAI_v1 } from "../old-versions/chess-engine-1.0.0/chessAI_v1";
import { VersionSelect } from "./VersionSelect";
import { chessAI_v2 } from "../old-versions/chess-engine-2.0.0/chessAI_v2";
import { chessAI_v3 } from "../old-versions/chess-engine-3.0.0/chessAI_v3";
import { ButtonGroup } from "./ButtonGroup";
import { SetupCard } from "./SetupCard";

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
  const [chessBot, setChessBot] = useState<
    ChessAI | chessAI_v1 | chessAI_v2 | chessAI_v3
  >();
  const [selectedVersion, setSelectedVersion] = useState<string>("1");
  const [isWhite, setIsWhite] = useState<boolean>(true);
  const [thinkTime, setThinkTime] = useState<string>("1");

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

  function setVersion(
    version: string,
    allowedThinkTime: number,
    color: string
  ) {
    switch (version) {
      case "Current":
        return () => new ChessAI(game, color as Color, allowedThinkTime);
      case "1":
        return () => new chessAI_v1(game, color, allowedThinkTime);
      case "2":
        return () => new chessAI_v2(game, color, allowedThinkTime);
      case "3":
        return () => new chessAI_v3(game, color as Color, allowedThinkTime);
      default:
        console.error("Invalid version: ", version);

        return null;
    }
  }

  function finishSetup(
    position: string,
    version: string,
    allowedDuration: number
  ) {
    const newGame = new Chess(position);
    setGame(newGame);
    setGameFEN(newGame.fen());
    const botColor = isWhite ? "b" : "w";
    const bot = setVersion(version, allowedDuration, botColor);
    console.log("Recieved position ", position);
    console.log("Recieved version: ", version);
    console.log("REcieved duration: ", allowedDuration);
    if (bot) {
      setChessBot(bot);
    }

    if (!isWhite) {
      setTimeout(() => {
        computeMove();
      }, 500);
    }
  }

  return (
    <Grid2 container spacing={2} sx={{ padding: "20px" }}>
      <SetupCard onFinishSetup={finishSetup} isHumanGame={true}></SetupCard>
      {/* First Grid Column with Input Form */}
      <Grid2 size={4}>
        <Grid2 container direction="column" spacing={2}>
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
    </Grid2>
  );
}

export default Game;
