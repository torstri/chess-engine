import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ButtonGroupProps {
  start?: boolean;
  pause?: boolean;
  togglePlay: (start: boolean, pause: boolean) => void;
  resetGame: () => void;
  isHumanGame: boolean;
  disabled: boolean;
}

export function ButtonGroup({
  start,
  pause,
  togglePlay,
  resetGame,
  isHumanGame,
  disabled,
}: ButtonGroupProps): JSX.Element {
  const navigate = useNavigate(); // Ensure navigation works inside the component

  return (
    <div className="button-group">
      {!isHumanGame ?
      <>
      {!start ? (
          <Button
            onClick={() => {
              togglePlay(true, false);
            }}
            variant="outlined"
            disabled={disabled}
          >
            Start
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => {
              togglePlay(!start, !pause);
            }}
            disabled={disabled}
          >
            Pause
          </Button>
        )}
        </>
        :
        <></>
      }
      <Button variant="outlined" onClick={resetGame} disabled={disabled}>
        Reset
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          navigate("/");
        }}
      >
        Home
      </Button>
    </div>
  );
}
