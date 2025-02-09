import { useEffect, useState, version } from "react";
import { Chess, Color, Move, DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import Button from "@mui/material/Button";
import "../../CSS/Game.css";
import { Grid2 } from "@mui/material";
import { ChessAI } from "../chessAI";
import { chessAI_v1 } from "../../old-versions/chess-engine-1.0.0/chessAI_v1";
import { chessAI_v2 } from "../../old-versions/chess-engine-2.0.0/chessAI_v2";
import { chessAI_v3 } from "../../old-versions/chess-engine-3.0.0/chessAI_v3";
import { ButtonGroup } from "../gameUI/ButtonGroup";
import { SetupCard } from "./SetupCard";
import { setVersion } from "./aiVersionMap";

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
  const [chessBot, setChessBot] = useState<
    ChessAI | chessAI_v1 | chessAI_v2 | chessAI_v3
  >();
  const [isPlayerWhite, setIsPlayerWhite] = useState<boolean>(true);
  const [startFen, setStartFen] = useState<string>(DEFAULT_POSITION);
  const [botSettings, setBotSettings] = useState<{version: string, time: number}>({version: "current", time: 500});
  
  
  useEffect(() => {
    setGameFEN(game.fen());
  }, [game]);

  useEffect(() => {
    if (sourceSelected && m != undefined) {
      setSelectedSquare(undefined);
      setSelectedPiece(undefined);
      setSrcSelected(false);

      setTimeout(() => { computeMove(chessBot) }, 200);
    }
  }, [m]);

  function computeMove(bot: any): boolean {
    if (game.isGameOver()) {
      console.log("Game Over");
      return false;
    }

    const move = bot.makeMove(game);
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

    // game.reset();
    // game.set
    const newGame = new Chess(startFen);
    setGame(newGame);
    setGameFEN(startFen);

    if (!isPlayerWhite) {
      computeMove(chessBot);
    }
  }

  function finishSetup(
    position: string,
    whiteVersion: string,
    blackVersion: string,
    allowedDuration: number
  ) {
    const newGame = new Chess(position);
    setGame(newGame);
    setGameFEN(newGame.fen());
    setStartFen(position);
    setBotSettings({version: isPlayerWhite ? blackVersion : whiteVersion, time: allowedDuration})

    setChessBot(() => {
      const newBot = setVersion(
                newGame,
                isPlayerWhite ? blackVersion : whiteVersion,
                allowedDuration,
                isPlayerWhite ? "b" : "w"
              )

      if (!isPlayerWhite) {
        computeMove(newBot);
      }

      return newBot;
    });
    
  }

  return (
    <div
      className="GameContainer"
      style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
    >
      <div className="ChessBoard" style={{ border: "solid", margin: "10px" }}>
        <Chessboard
          boardWidth={800}
          position={gameFEN}
          onSquareClick={handleSquareClick}
          boardOrientation={isPlayerWhite ? "white" : "black"}
        />
      </div>
      <Grid2
        style={{
          minWidth: "30%",
          maxWidth: "30%",
          flexShrink: 0,
          padding: "10px",
        }}
      >
        <SetupCard onFinishSetup={finishSetup} isHumanGame={true} versionColor={isPlayerWhite ? "b" : "w"}></SetupCard>
        <Button
          onClick={() => { setIsPlayerWhite(!isPlayerWhite) }}
          variant="outlined"
          sx={{
            backgroundColor: isPlayerWhite ? "white" : "black",
            color: isPlayerWhite ? "black" : "white",
            borderColor: "black",
            "&:hover": {
              backgroundColor: isPlayerWhite ? "#f0f0f0" : "#333",
            },
            marginTop: "10px",
          }}
        >
          {isPlayerWhite ? "Playing as White" : "Playing as Black"}
        </Button>
        <ButtonGroup
          pause={false}
          togglePlay={() => {}}
          resetGame={resetGame}
          isHumanGame={true}
          disabled={false}
        ></ButtonGroup>
      </Grid2>
      {chessBot?.root?.state && (
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          Evaluation = {chessBot.root?.state.totalScore / chessBot.root?.visits}
        </div>
      )}
    </div>
  );
}

export default Game;
