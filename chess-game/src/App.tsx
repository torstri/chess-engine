import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./home/Home";
import Game from "./chess/Game";

function App(): JSX.Element {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={ <Home /> } />
      <Route path="game" element={ <Game /> } />
    </Routes>
  </BrowserRouter>
  );
}

export default App;