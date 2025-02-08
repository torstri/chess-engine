import { useEffect, useState } from "react";
import { openings, ChessOpening } from "../utils/StartPositions";
import {
  Button,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { VersionSelect } from "./VersionSelect";

interface props {
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
  versionColor?: string,
}

const defaultSettings = {
  evalTime: 500,
  numGames: 10,
  position: openings[0].fen
};

export function SetupCard({
  onFinishSetup,
  onNumberOfGamesChange,
  isHumanGame,
  versionColor,
}: props): JSX.Element {
  // Allowed evaluation time & number of games
  const [evaluationTime, setEvaluationTime] = useState<number>(defaultSettings.evalTime);
  const [numberOfGames, setNumberOfGames] = useState<number>(defaultSettings.numGames);
  const [validSetup, setValidSetup] = useState<boolean>(false);
  const [startPosition, setStartPosition] = useState<string>(defaultSettings.position);

  // Strings for vesion selection
  const [whiteVersion, setWhiteVersion] = useState<string>("");
  const [blackVersion, setBlackVersion] = useState<string>("");

  useEffect(() => {
    setValidSetup(
      startPosition !== "" &&
        whiteVersion !== "" &&
        blackVersion !== "" &&
        evaluationTime > 0 &&
        numberOfGames > 0
    );
  }, [
    whiteVersion,
    blackVersion,
    numberOfGames,
    evaluationTime,
    startPosition,
  ]);

  function handleVersionSelect(version: string, color: string) {
    switch (color) {
      case "w":
        setWhiteVersion(version);
        break;
      case "b":
        setBlackVersion(version);
        break;
      default:
        break;
    }
  }

  const handleStartPositionChange = (event: SelectChangeEvent) => {
    const newFEN = event.target.value;
    setStartPosition(newFEN);
  };

  function finishSetup() {
    onFinishSetup(startPosition, whiteVersion, blackVersion, evaluationTime);
    if (onNumberOfGamesChange) {
      onNumberOfGamesChange(numberOfGames);
    }
  }

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={12}>
        <VersionSelect
          isHumanGame={isHumanGame}
          onVersionSelect={handleVersionSelect}
          versionColor={versionColor}
        ></VersionSelect>
      </Grid2>
      <Grid2 container spacing={3} size={12}>
        {/* Evaluation Time Input */}
        <FormControl fullWidth>
          <TextField
            id="think-time"
            label="AI Think Time (ms)"
            defaultValue={defaultSettings.evalTime}
            onChange={(e) => setEvaluationTime(parseInt(e.target.value, 10)) }
            variant="outlined"
            type="number"
            helperText="Set the time in milliseconds"
          />
        </FormControl>

        {/* Number of games input */}
        {!isHumanGame && (
          <FormControl fullWidth>
            <TextField
              id="gameInput"
              label="Number of games"
              defaultValue={defaultSettings.numGames}
              onChange={(e) => setNumberOfGames(parseInt(e.target.value, 10)) }
              variant="outlined"
              type="number"
              helperText="Set the number of games to be played"
            />
          </FormControl>
        )}
      </Grid2>
      <Grid2 size={12}>
        <FormControl fullWidth>
          <InputLabel>Select a start position</InputLabel>
          <Select defaultValue={defaultSettings.position} value={startPosition} onChange={handleStartPositionChange}>
            {openings.map((opening: ChessOpening) => (
              <MenuItem key={opening.fen} value={opening.fen}>
                {opening.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid2>
      <Grid2>
        <Button
          disabled={!validSetup && !isHumanGame}
          variant="outlined"
          onClick={finishSetup}
        >
          Finish Setup
        </Button>
      </Grid2>
    </Grid2>
  );
}
