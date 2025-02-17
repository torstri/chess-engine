import { Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ButtonGroupProps {
  onStart?: (start: boolean) => void;
  onReset: () => void;
  disable: boolean;
  isHumanGame: boolean;
  
}

export function ButtonGroup({
  onStart,
  onReset,
  disable,
  isHumanGame,
}: ButtonGroupProps): JSX.Element {
  const navigate = useNavigate(); // Ensure navigation works inside the component
  const [start, setStart] = useState<boolean>();

  return (
    <div className="button-group">
      <Button
          onClick={() => {
            setStart((s) => {
              if(onStart) onStart(!s)
              return !s
            });
          }}
          variant="outlined"
          disabled={disable}
          sx={{ visibility: isHumanGame ? 'hidden' : 'visible' }}
        >
        {start ? 'pause' : 'start'}
      </Button>
      <Button variant="outlined" onClick={onReset} disabled={disable}>
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
