import { CardContent } from "@mui/material";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import { useNavigate } from 'react-router-dom';



function Home(): JSX.Element {
    const navigate = useNavigate();

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
            <ButtonGroup variant="text" aria-label="Basic button group" size="large">
                <Button sx={{ color: 'black' }} onClick={() => { navigate("/game") }}>Play against AI</Button>
                <Button sx={{ color: 'black' }}>AI vs AI</Button>
            </ButtonGroup>
        </CardContent>
        </Card>
    )
}

export default Home;