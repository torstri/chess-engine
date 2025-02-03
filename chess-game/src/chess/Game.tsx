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

  // useEffect(() => {
  //   setChessBot(() => {
  //     return new ChessAI(game, "b", 200);
  //   });
  // }, []);

  function computeMove(): boolean {
    if (game.isGameOver()) {
      console.log("Game Over");
      setLoading(false);
      return false;
    }
    console.log("Bot: ", chessBot);
    console.log("Game: ", game);
    const move = chessBot?.makeMove(game);
    console.log("Recieved move: ", move);
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

    // setChessBot(() => {
    //   return new ChessAI(game, "b", 200);
    // });
  }

  const handleColorClick = () => {
    setIsWhite(!isWhite);
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

  function dummy(start: boolean, pause: boolean) {}

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
      {/* First Grid Column with Input Form */}
      <Grid2 container size={6} spacing={1}>
        <SetupCard onFinishSetup={finishSetup} isHumanGame={true}></SetupCard>
        <Grid2>
          {/* Play Color Button */}
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
            {isWhite ? "Playing as White" : "Playing as Black"}
          </Button>
        </Grid2>
        <Grid2 container spacing={1}>
          <ButtonGroup
            pause={false}
            togglePlay={dummy}
            resetGame={resetGame}
            isHumanGame={true}
          ></ButtonGroup>
        </Grid2>
      </Grid2>

      {/* Second Grid Column with Chessboard */}
      <Grid2 size={6}>
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
