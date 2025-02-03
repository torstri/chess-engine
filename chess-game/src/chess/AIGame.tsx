import { useEffect, useState } from "react";
import { Chess, Color, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ChessAI } from "./chessAI";
import { chessAI_v1 } from "../old-versions/chess-engine-1.0.0/chessAI_v1";
import { chessAI_v2 } from "../old-versions/chess-engine-2.0.0/chessAI_v2";
import { chessAI_v3 } from "../old-versions/chess-engine-3.0.0/chessAI_v3";
import { SetupCard } from "./SetupCard";
import { Player } from "./utils/Types";

import "../CSS/AIGame.css";
import { Grid2 } from "@mui/material";
import { StatisticTable } from "./StatisticTable";
import { ButtonGroup } from "./ButtonGroup";

function AIGame(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [whiteBot, setWhiteBot] = useState<any>();
  const [blackBot, setBlackBot] = useState<any>();
  const [isBlackPlayer, setIsBlackPlayer] = useState<boolean>(false);
  const [isWhitePlayer, setIsWhitePlayer] = useState<boolean>(false);
  const [startFen, setStartFen] = useState<string>();

  const [start, setStart] = useState<boolean>(false);
  const [turn, setTurn] = useState<boolean>(false); // white: true, black: false
  const [pause, setPause] = useState<boolean>(false);
  const [numberOfGames, setNumberOfGames] = useState<number>(1);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [whiteWins, setwhiteWins] = useState<number>(0);
  const [blackWins, setBlackWins] = useState<number>(0);
  const [draws, setDraws] = useState<number>(0);

  const [selectedPiece, setSelectedPiece] = useState<string>();
  const [selectedSquare, setSelectedSquare] = useState<Square | undefined>(
    undefined
  );
  const [sourceSelected, setSrcSelected] = useState<boolean>();

  const [turnCounter, setTurnCounter] = useState<number>(0);

  const [thinkTime, setThinkTime] = useState<string>("1");

  const turnDuration = 1;

  type ModifyFunction = (game: Chess) => void;

  useEffect(() => {
    if (start && !pause) {
      if (
        !(isWhitePlayer && turnCounter % 2 == 0) ||
        !(isBlackPlayer && turnCounter % 2 == 1)
      ) {
        const playMove = async () => {
          const success = playNextMove();
          if (!success) {
            setStart(false);
          }
        };
        const timerId = setTimeout(playMove, turnDuration);
        return () => clearTimeout(timerId);
      }
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
        togglePlay(true, false);
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
      return moveUpdate(move);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function isPlayerTurn() {
    return (
      (isWhitePlayer && turnCounter % 2 == 0) ||
      (isBlackPlayer && turnCounter % 2 != 0)
    );
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
    if (sourceSelected && isPlayerTurn()) {
      safeGameMutate((game) => {
        try {
          game.move({
            from: selectedSquare,
            to: square,
            promotion: "q",
          } as Move);
          setGame(game);
        } catch (e) {
          console.error(e);
          setSelectedSquare(undefined);
          setSelectedPiece(undefined);
          setSrcSelected(false);
          return;
        }

        setTurnCounter(turnCounter + 1);
      });
    } else if (piece != undefined) {
      setSelectedSquare(square);
      setSelectedPiece(piece);
      setSrcSelected(true);
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

  function togglePlay(start: boolean, pause: boolean) {
    setStart(start);
    setPause(pause);
    setTurnCounter(0);
  }

  function resetGame() {
    setStart(false);
    setPause(false);
    const newGame = new Chess(startFen);
    setGame(newGame);
    setGameFEN(newGame.fen());
    setTurnCounter(0);
  }

  function setVersion(
    version: string,
    allowedThinkTime: number,
    color: string,
    game: Chess
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
      default: // We have chosen player
        return undefined;
    }
  }

  function handleSetupUpdate(
    position: string,
    version: string,
    time: number,
    color?: string
  ) {
    const newGame = new Chess(position);
    setGame(newGame);
    setGameFEN(position);
    setStartFen(position);

    switch (version) {
      case "Player":
        if (version === "Player" && color === "w") {
          setIsWhitePlayer(true);
          setIsBlackPlayer(false);
        }

        if (version === "Player" && color === "b") {
          setIsBlackPlayer(true);
          setIsWhitePlayer(false);
        }

        togglePlay(false, true);
        break;
      default:
        if (color === "w") {
          setWhiteBot(setVersion(version, time, "w", newGame));
        }

        if (color === "b") {
          setBlackBot(setVersion(version, time, "b", newGame));
        }
        break;
    }
  }

  return (
    <Grid2 container spacing={2} sx={{ padding: "20px" }}>
      <Grid2 size={6}>
        <Chessboard position={gameFEN} onSquareClick={handleSquareClick} />
      </Grid2>
      <Grid2 size={6}>
        <SetupCard
          onFinishSetup={handleSetupUpdate}
          onNumberOfGamesChange={setNumberOfGames}
          isStart={start}
          isHumanGame={false}
        />
        <ButtonGroup
          start={start}
          pause={pause}
          togglePlay={togglePlay}
          resetGame={resetGame}
        ></ButtonGroup>
      </Grid2>
      <Grid2 size={12}>
        <StatisticTable
          whiteWins={whiteWins}
          blackWins={blackWins}
          draws={draws}
          gamesPlayed={gamesPlayed}
        ></StatisticTable>
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
