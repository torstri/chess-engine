import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./home/Home";
import Game from "./chess/Game";
import AIvsAI from "./chess/AIGame";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="game" element={<Game />} />
        <Route path="ai-vs-ai" element={<AIvsAI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
