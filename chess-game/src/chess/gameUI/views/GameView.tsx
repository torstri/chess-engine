import { Chessboard } from "react-chessboard";
import { Square, Move } from "chess.js";
import { SetupPresenter } from "../presenters/SetupPresenter";
import { ButtonGroup } from "../ButtonGroup";
import { Button } from "@mui/material";

interface props {
  handleSquareClick: (square: Square, piece?: string) => void;
  onResetGame: () => void;
  onFinishSetup: (
    position: string,
    whiteVersion: string,
    blackVersion: string,
    time: number,
    color?: string
  ) => void;
  onTogglePlayerColor: (isPlayerWhite: boolean) => void;
  isPlayerWhite: boolean;
  fen: string;
  disable: boolean;
  versionColor: string;
}

export function GameView({
  handleSquareClick,
  onFinishSetup,
  onResetGame,
  onTogglePlayerColor,
  isPlayerWhite,
  fen,
  disable,
  versionColor,
}: props): JSX.Element {
  return (
    <div
      className="GameContainer"
      style={{ display: "flex", alignItems: "flex-start" }}
    >
      <div className="ChessBoard" style={{ border: "solid", margin: "10px" }}>
        <Chessboard
          boardWidth={800}
          position={fen}
          onSquareClick={handleSquareClick}
          boardOrientation={isPlayerWhite ? "white" : "black"}
        />
      </div>
      <div
        style={{
          minWidth: "30%",
          maxWidth: "30%",
          flexShrink: 0,
          padding: "10px",
        }}
      >
        <SetupPresenter
          onFinishSetup={onFinishSetup}
          versionColor={versionColor}
          isHumanGame={true}
        />
        <Button
          onClick={() => {
            onTogglePlayerColor(!isPlayerWhite);
          }}
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
          onReset={() => onResetGame()}
          disable={disable}
          isHumanGame={true}
        />
      </div>
    </div>
  );
}
