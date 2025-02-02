import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ButtonGroupProps {
  start: boolean;
  pause: boolean;
  turn: boolean;
  togglePlay: (start: boolean, pause: boolean, turn: boolean) => void;
  resetGame: () => void;
  finishSetup: () => void;
}

export function ButtonGroup({
  start,
  pause,
  turn,
  togglePlay,
  resetGame,
  finishSetup,
}: ButtonGroupProps): JSX.Element {
  const navigate = useNavigate(); // Ensure navigation works inside the component

  return (
    <div className="button-group">
      {!start ? (
        <Button
          onClick={() => {
            togglePlay(true, false, !turn);
          }}
          variant="outlined"
        >
          Start
        </Button>
      ) : (
        <Button
          variant="outlined"
          onClick={() => {
            togglePlay(!start, !pause, !turn);
          }}
        >
          Pause
        </Button>
      )}
      <Button
        variant="outlined"
        onClick={() => {
          navigate("/");
        }}
      >
        Home
      </Button>
      <Button variant="outlined" onClick={resetGame}>
        Reset
      </Button>
      <Button variant="outlined" onClick={finishSetup}>
        Finish Setup
      </Button>
    </div>
  );
}
