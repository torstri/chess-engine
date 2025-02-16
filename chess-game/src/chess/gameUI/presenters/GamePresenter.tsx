import { useEffect, useState, version } from "react";
import { Chess, Color, Move, DEFAULT_POSITION } from "chess.js";
import { Square } from "react-chessboard/dist/chessboard/types";
import "../../../CSS/Game.css";
import { setVersion } from "../aiVersionMap";
import { GameView } from "../views/GameView";

// Define the type for the modify function used in safeGameMutate
type ModifyFunction = (game: Chess) => void;

function GamePresenter(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [selectedPiece, setSelectedPiece] = useState<string>();
  const [selectedSquare, setSelectedSquare] = useState<Square | undefined>(
    undefined
  );
  const [sourceSelected, setSrcSelected] = useState<boolean>();
  const [m, setMove] = useState<Move | undefined>(undefined);
  const [chessBot, setChessBot] = useState<any>();
  const [isPlayerWhite, setIsPlayerWhite] = useState<boolean>(true);
  const [startFen, setStartFen] = useState<string>(DEFAULT_POSITION);
  const [botSettings, setBotSettings] = useState<{
    version: string;
    time: number;
  }>({ version: "current", time: 500 });

  useEffect(() => {
    setGameFEN(game.fen());
  }, [game]);

  useEffect(() => {
    if (sourceSelected && m != undefined) {
      setSelectedSquare(undefined);
      setSelectedPiece(undefined);
      setSrcSelected(false);

      setTimeout(() => {
        computeMove(chessBot);
      }, 200);
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
    setBotSettings({
      version: isPlayerWhite ? blackVersion : whiteVersion,
      time: allowedDuration,
    });

    setChessBot(() => {
      const newBot = setVersion(
        newGame,
        isPlayerWhite ? blackVersion : whiteVersion,
        allowedDuration,
        isPlayerWhite ? "b" : "w"
      );

      if (!isPlayerWhite) {
        computeMove(newBot);
      }

      return newBot;
    });
  }

  return <GameView 
          onResetGame={resetGame}
          onFinishSetup={finishSetup}
          handleSquareClick={handleSquareClick}
          onTogglePlayerColor={(playerColor: boolean) => {setIsPlayerWhite(playerColor)}}
          fen={gameFEN}
          isPlayerWhite={isPlayerWhite}
          disable={!chessBot}
          versionColor={isPlayerWhite ? "b" : "w"}
        />
}

export default GamePresenter;
