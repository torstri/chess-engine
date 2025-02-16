import { Container, FormControl, Box, InputLabel, Select, Button, TextField, MenuItem } from "@mui/material";
import { VersionSelect } from "../VersionSelect";
import { ChessOpening, openings } from "../StartPositions";


interface props {
    onInputChange: (input: string, field: "evaluationTime" | "numberOfGames") => void;
    onStartPositionChange: (input: string) => void;
    onVersionSelect: (version: string, color: string) => void;
    onFinishSetup: () => void;
    validSetup: boolean;
    isHumanGame: boolean;
    versionColor?: string;
    defaultSettings: any;
    settings: any;
}

export function SetupView({
    onInputChange,
    onStartPositionChange,
    onVersionSelect,
    onFinishSetup,
    validSetup,
    isHumanGame,
    versionColor,
    defaultSettings,
    settings,
}: props) {

    return (
        <Container>
          <VersionSelect
            isHumanGame={isHumanGame}
            onVersionSelect={onVersionSelect}
            versionColor={versionColor}
          />
          <Box mt={3}>
            <FormControl fullWidth>
              <TextField
                id="think-time"
                label="AI Think Time (ms)"
                defaultValue={defaultSettings.evalTime}
                onChange={(e) =>
                  onInputChange(e.target.value, "evaluationTime")
                }
                variant="outlined"
                type="number"
                helperText="Set the time in milliseconds"
              />
            </FormControl>
          </Box>
          {!isHumanGame && (
            <Box mt={3}>
              <FormControl fullWidth>
                <TextField
                  id="gameInput"
                  label="Number of games"
                  defaultValue={defaultSettings.numGames}
                  onChange={(e) =>
                    onInputChange(e.target.value, "numberOfGames")
                  }
                  variant="outlined"
                  type="number"
                  helperText="Set the number of games to be played"
                />
              </FormControl>
            </Box>
          )}
          <Box mt={3}>
            <FormControl fullWidth>
              <InputLabel>Select a start position</InputLabel>
              <Select
                defaultValue={defaultSettings.position}
                value={settings.startPosition}
                onChange={(e) => onStartPositionChange(e.target.value)}
              >
                {openings.map((opening: ChessOpening) => (
                  <MenuItem key={opening.fen} value={opening.fen}>
                    {opening.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mt={3}>
            <Button
              disabled={!validSetup}
              variant="outlined"
              onClick={onFinishSetup}
            >
              Finish Setup
            </Button>
          </Box>
        </Container>
      );
}