import { useState } from "react";
import "../../CSS/Game.css";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid2,
} from "@mui/material";
import { aiVersions } from "./aiVersionMap";

interface VersionSelectProps {
  onVersionSelect: (version: string, color: string) => void;
  isHumanGame: boolean;
  versionColor?: string;
}

export function VersionSelect({
  onVersionSelect,
  isHumanGame,
  versionColor,
}: VersionSelectProps): JSX.Element {

  const [blackVersion, setBlackVersion] = useState<string>("");
  const [whiteVersion, setWhiteVersion] = useState<string>("");
  
  function renderVersion(version: string, index: number) {
    return (
      <MenuItem key={index} value={version}>
        Version: {version}
      </MenuItem>
    );
  }
  
  function handleVersionSelect(version: string, color: string): void {
    
    onVersionSelect(version, color);
    
    if(color === "w") setWhiteVersion(version);
    if(color === "b") setBlackVersion(version);

  };

  return (
    <Grid2 container spacing={1}>
      {isHumanGame && versionColor ? (
        <FormControl fullWidth>
          <InputLabel id="version-select-label">
            Select an AI version
          </InputLabel>
          <Select
            labelId="version-select-label"
            value={versionColor === "w" ? whiteVersion : blackVersion}
            label="Select an AI version"
            onChange={(e) => {
              handleVersionSelect(e.target.value, versionColor);
            }}
          >
            {Object.keys(aiVersions).map(renderVersion)}
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
                handleVersionSelect(e.target.value, "w");
              }}
            >
              {Object.keys(aiVersions).map(renderVersion)}
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
                handleVersionSelect(e.target.value, "b");
              }}
            >
              {Object.keys(aiVersions).map(renderVersion)}
            </Select>
          </FormControl>
        </>
      )}
    </Grid2>
  );
}
