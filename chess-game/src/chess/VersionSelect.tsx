import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "../CSS/Game.css";
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
} from "@mui/material";
interface VersionSelectProps {
  description: string;
  selectedVersion: string;
  setSelectedVersion: Dispatch<string>;
}

export function VersionSelect({
  description,
  selectedVersion,
  setSelectedVersion,
}: VersionSelectProps): JSX.Element {
  const handleVersionSelect = (event: SelectChangeEvent) => {
    setSelectedVersion(event.target.value as string);
    // console.log("Selected White Version: ", event.target.value);
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="version-select-label">{description}</InputLabel>
      <Select
        labelId="version-select-label"
        value={selectedVersion}
        label="Select an AI version"
        onChange={handleVersionSelect}
      >
        <MenuItem value="current">Version: Current</MenuItem>

        <MenuItem value="1">Version: 1</MenuItem>
        <MenuItem value="2">Version: 2</MenuItem>
        <MenuItem value="3">Version: 3</MenuItem>
      </Select>
    </FormControl>
  );
}
