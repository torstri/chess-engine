import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ButtonGroupProps {
  start?: boolean;
  pause?: boolean;
  togglePlay: (start: boolean, pause: boolean) => void;
  resetGame: () => void;
  isHumanGame: boolean;
}

export function ButtonGroup({
  start,
  pause,
  togglePlay,
  resetGame,
  isHumanGame,
}: ButtonGroupProps): JSX.Element {
  const navigate = useNavigate(); // Ensure navigation works inside the component

  return (
    <div className="button-group">
      {!start && !isHumanGame ? (
        <Button
          onClick={() => {
            togglePlay(true, false);
          }}
          variant="outlined"
        >
          Start
        </Button>
      ) : (
        <Button
          variant="outlined"
          onClick={() => {
            togglePlay(!start, !pause);
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
    </div>
  );
}
