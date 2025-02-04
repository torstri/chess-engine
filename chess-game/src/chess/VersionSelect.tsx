import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "../CSS/Game.css";
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Grid2,
} from "@mui/material";

interface VersionSelectProps {
  onVersionSelect: (version: string, color: string) => void;
  isHumanGame: boolean;
}

export function VersionSelect({
  onVersionSelect,
  isHumanGame,
}: VersionSelectProps): JSX.Element {
  function renderVersion(version: string, index: number) {
    return (
      <MenuItem key={index} value={version}>
        Version: {version}
      </MenuItem>
    );
  }
  const availableVersions = ["1", "2", "3", "Current"];
  const [blackVersion, setBlackVersion] = useState<string>("");
  const [whiteVersion, setWhiteVersion] = useState<string>("");

  const handleVersionSelect = (event: SelectChangeEvent, color: string) => {
    onVersionSelect(event.target.value, color);
    color == "w"
      ? setWhiteVersion(event.target.value)
      : setBlackVersion(event.target.value);
  };

  return (
    <Grid2 container spacing={1}>
      {isHumanGame ? (
        <FormControl fullWidth>
          <InputLabel id="version-select-label">
            Select an AI version
          </InputLabel>
          <Select
            labelId="version-select-label"
            value={whiteVersion}
            label="Select an AI version"
            onChange={(e) => {
              handleVersionSelect(e, "w");
            }}
          >
            {availableVersions.map(renderVersion)}
          </Select>
        </FormControl>
      ) : (
        <>
          <FormControl fullWidth>
            <InputLabel id="version-select-label">
              Select a version for White
            </InputLabel>
            <Select
              labelId="version-select-label"
              value={whiteVersion}
              label="Select an AI version"
              onChange={(e) => {
                handleVersionSelect(e, "w");
              }}
            >
              {availableVersions.map(renderVersion)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="version-select-label">
              Select a version for Black
            </InputLabel>
            <Select
              labelId="version-select-label"
              value={blackVersion}
              label="Select an AI version"
              onChange={(e) => {
                handleVersionSelect(e, "b");
              }}
            >
              {availableVersions.map(renderVersion)}
            </Select>
          </FormControl>
        </>
      )}
    </Grid2>
  );
}
