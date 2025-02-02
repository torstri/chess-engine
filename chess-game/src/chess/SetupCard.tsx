import { useEffect, useState } from "react";
import { openings, ChessOpening } from "./StartPositions";
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
    version: string,
    time: number,
    color: string
  ) => void;
  onNumberOfGamesChange: (numberOfGames: number) => void;
  isStart: boolean;
}

export function SetupCard({
  onFinishSetup,
  onNumberOfGamesChange,
  isStart,
}: props): JSX.Element {
  // Allowed evaluation time & number of games
  const [evaluationTime, setEvaluationTime] = useState<number>(0);
  const [numberOfGames, setNumberOfGames] = useState<number>(1);
  const [validSetup, setValidSetup] = useState<boolean>(false);
  const [startPosition, setStartPosition] = useState<string>("");

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

  const handleEvaluationTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    // Ensure that the value is either an empty string or a positive integer
    if (value === "" || /^[0-9]+$/.test(value)) {
      setEvaluationTime(Number(value));
    }
  };

  const handleNumberOfGamesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    // Ensure that the value is either an empty string or a positive integer
    if (value === "" || /^[0-9]+$/.test(value)) {
      setNumberOfGames(Number(value));
    }
  };

  function handleVersionSelect(version: string, color: string) {
    switch (color) {
      case "w":
        setWhiteVersion(version);
        break;
      case "b":
        setBlackVersion(version);
        break;
      default:
        console.error("invalid version");
        break;
    }
  }

  const handleStartPositionChange = (event: SelectChangeEvent) => {
    const newFEN = event.target.value;
    setStartPosition(newFEN);
  };

  function finishSetup() {
    onFinishSetup(startPosition, whiteVersion, evaluationTime, "w");
    onFinishSetup(startPosition, blackVersion, evaluationTime, "b");
    onNumberOfGamesChange(numberOfGames);
  }

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={12}>
        <VersionSelect onVersionSelect={handleVersionSelect}></VersionSelect>
      </Grid2>
      <Grid2 container spacing={3} size={12}>
        {/* Evaluation Time Input */}
        <FormControl fullWidth>
          <TextField
            id="think-time"
            label="AI Think Time (ms)"
            value={evaluationTime === 0 ? "" : evaluationTime} // Show empty when 0
            onChange={(e) =>
              setEvaluationTime(
                e.target.value === "" ? 0 : parseInt(e.target.value, 10)
              )
            }
            variant="outlined"
            type="number"
            helperText="Set the time in milliseconds"
          />
        </FormControl>

        {/* Number of games input */}
        {!(whiteVersion === "Player" || blackVersion === "Player") && (
          <FormControl fullWidth>
            <TextField
              id="gameInput"
              label="Number of games"
              value={numberOfGames === 0 ? "" : numberOfGames} // Show empty when 0
              onChange={(e) =>
                setNumberOfGames(
                  e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                )
              }
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
          <Select value={startPosition} onChange={handleStartPositionChange}>
            {openings.map((opening: ChessOpening) => (
              <MenuItem key={opening.fen} value={opening.fen}>
                {opening.name} {/* Show only the name, not the FEN */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid2>
      <Grid2>
        <Button
          disabled={!validSetup || isStart}
          variant="outlined"
          onClick={finishSetup}
        >
          Finish Setup
        </Button>
      </Grid2>
    </Grid2>
  );
}
