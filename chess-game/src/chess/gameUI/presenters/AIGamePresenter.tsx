import { useEffect, useState } from "react";
import { Chess, Move, DEFAULT_POSITION } from "chess.js";
import { Player } from "../../engine/utils/Types";
import "../../../CSS/AIGame.css";
import { setVersion } from "../aiVersionMap";
import { AIGameView } from "../views/AIGameView";

function AIGamePresenter(): JSX.Element {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameFEN, setGameFEN] = useState<string>(game.fen());
  const [whiteBot, setWhiteBot] = useState<any>();
  const [blackBot, setBlackBot] = useState<any>();
  const [isBlackPlayer, setIsBlackPlayer] = useState<boolean>(false);
  const [isWhitePlayer, setIsWhitePlayer] = useState<boolean>(false);
  const [startFen, setStartFen] = useState<string>(DEFAULT_POSITION);

  const [start, setStart] = useState<boolean>(false);
  const [pause, setPause] = useState<boolean>(false);
  const [numberOfGames, setNumberOfGames] = useState<number>(1);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [whiteWins, setwhiteWins] = useState<number>(0);
  const [blackWins, setBlackWins] = useState<number>(0);
  const [draws, setDraws] = useState<number>(0);
  const [turnCounter, setTurnCounter] = useState<number>(0);

  const turnDuration = 1;

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
  }, [pause, start, gameFEN]);

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
        togglePlay(true);
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

  function togglePlay(start: boolean) {
    // setStart(start);
    // setPause(pause);
    setStart(start);
    setPause(!start);
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

  function handleSetupChange(
    position: string,
    whiteVersion: string,
    blackVersion: string,
    time: number
  ) {
    const newGame = new Chess(position);
    setGame(newGame);
    setGameFEN(position);
    setStartFen(position);

    setWhiteBot(setVersion(newGame, whiteVersion, time, "w"));
    setBlackBot(setVersion(newGame, blackVersion, time, "b"));
  }

  return (
    <AIGameView
      onTogglePlay={togglePlay}
      onResetGame={resetGame}
      onFinishSetup={handleSetupChange}
      onSetNumberOfGames={setNumberOfGames}
      fen={gameFEN}
      whiteWins={whiteWins}
      blackWins={blackWins}
      gamesPlayed={gamesPlayed}
      disable={!(whiteBot && blackBot)}
    />
  );
}

export default AIGamePresenter;
