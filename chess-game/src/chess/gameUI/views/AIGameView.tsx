import { Chessboard } from "react-chessboard";
import { ButtonGroup } from "../ButtonGroup";
import { StatisticTable } from "../StatisticTable";
import { SetupPresenter } from "../presenters/SetupPresenter";

interface props {
  onTogglePlay: (start: boolean) => void;
  onResetGame: () => void;
  onFinishSetup: (
    position: string,
    whiteVersion: string,
    blackVersion: string,
    time: number,
    color?: string
  ) => void;
  onSetNumberOfGames: (numberOfGames: number) => void;
  fen: string;
  whiteWins: number;
  blackWins: number;
  gamesPlayed: number;
  disable: boolean;
}

export function AIGameView({
  onTogglePlay,
  onResetGame,
  onFinishSetup,
  onSetNumberOfGames,
  fen,
  whiteWins,
  blackWins,
  gamesPlayed,
  disable,
}: props): JSX.Element {
  return (
    <div
      className="GameContainer"
      style={{ display: "flex", alignItems: "flex-start" }}
    >
      <div style={{ border: "solid", margin: "10px" }}>
        <Chessboard boardWidth={800} position={fen} />
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
          onNumberOfGamesChange={onSetNumberOfGames}
          isHumanGame={false}
        />
        <ButtonGroup
          onStart={(start) => onTogglePlay(start)}
          onReset={() => onResetGame()}
          disable={disable}
          isHumanGame={false}
        />
        <StatisticTable
          whiteWins={whiteWins}
          blackWins={blackWins}
          draws={gamesPlayed - whiteWins - blackWins}
          gamesPlayed={gamesPlayed}
        />
      </div>
    </div>
  );
}
