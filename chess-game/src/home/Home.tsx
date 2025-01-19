import { CardContent } from "@mui/material";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";

function Home(): JSX.Element {
  return (
    <Card
      sx={{
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
      }}
    >
      <CardContent color="black">
        <ButtonGroup
          variant="text"
          aria-label="Basic button group"
          size="large"
        >
          <Link href="/game" underline="none" color="black">
            <Button sx={{ color: "black" }}>Play against AI</Button>
          </Link>
          <Link href="/ai-vs-ai" underline="none" color="black">
            <Button sx={{ color: "black" }}>AI vs AI</Button>
          </Link>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
}

export default Home;
