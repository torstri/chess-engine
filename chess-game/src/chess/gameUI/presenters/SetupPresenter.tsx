import { useEffect, useState } from "react";
import { openings, ChessOpening } from "../StartPositions";
import { SetupView } from "../views/SetupView";

interface Props {
  onFinishSetup: (
    position: string,
    whiteVersion: string,
    blackVersion: string,
    time: number,
    color?: string
  ) => void;
  onNumberOfGamesChange?: (numberOfGames: number) => void;
  isStart?: boolean;
  isHumanGame: boolean;
  versionColor?: string;
}

const defaultSettings = {
  evalTime: 500,
  numGames: 10,
  position: openings[0].fen,
};

export function SetupPresenter({
  onFinishSetup,
  onNumberOfGamesChange,
  isHumanGame,
  versionColor,
}: Props): JSX.Element {
  const [settings, setSettings] = useState({
    evaluationTime: defaultSettings.evalTime,
    numberOfGames: defaultSettings.numGames,
    startPosition: defaultSettings.position,
    whiteVersion: "",
    blackVersion: "",
  });

  const isValidSetup = (): boolean => {
    const {
      evaluationTime,
      numberOfGames,
      startPosition,
      whiteVersion,
      blackVersion,
    } = settings;
    const hasValidVersions =
      (whiteVersion !== "" && blackVersion !== "") ||
      (isHumanGame && (whiteVersion !== "" || blackVersion !== ""));
    return (
      startPosition !== "" &&
      hasValidVersions &&
      evaluationTime > 0 &&
      (isHumanGame || numberOfGames > 0)
    );
  };

  function handleVersionSelect(version: string, color: string) {
    setSettings((prev) => ({
      ...prev,
      whiteVersion: color === "w" ? version : prev.whiteVersion,
      blackVersion: color === "b" ? version : prev.blackVersion,
    }));
  }

  const handleInputChange = (
    input: string,
    field: "evaluationTime" | "numberOfGames"
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: parseInt(input, 10),
    }));
  };

  const handleStartPositionChange = (input: string) => {
    setSettings((prev) => ({
      ...prev,
      startPosition: input,
    }));
  };

  function finishSetup() {
    const {
      startPosition,
      whiteVersion,
      blackVersion,
      evaluationTime,
      numberOfGames,
    } = settings;
    onFinishSetup(startPosition, whiteVersion, blackVersion, evaluationTime);
    if (onNumberOfGamesChange) {
      onNumberOfGamesChange(numberOfGames);
    }
  }

  return <SetupView 
          onInputChange={handleInputChange}
          onStartPositionChange={handleStartPositionChange}
          onVersionSelect={handleVersionSelect}
          onFinishSetup={finishSetup}
          validSetup={isValidSetup()}
          versionColor={versionColor}
          defaultSettings={defaultSettings}
          settings={settings}
          isHumanGame={isHumanGame}
  
  />
}
