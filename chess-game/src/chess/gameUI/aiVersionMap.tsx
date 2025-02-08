import { Chess, Color } from "chess.js";
import { ChessAI } from "../chessAI";
import { chessAI_v1 } from "../../old-versions/chess-engine-1.0.0/chessAI_v1";
import { chessAI_v2 } from "../../old-versions/chess-engine-2.0.0/chessAI_v2";
import { chessAI_v3 } from "../../old-versions/chess-engine-3.0.0/chessAI_v3";

export const aiVersions: Record<string, (game: Chess, color: Color, thinkTime: number) => any> = {
    "Current": (game, color, thinkTime) => new ChessAI(game, color, thinkTime),
    "1": (game, color, thinkTime) => new chessAI_v1(game, color, thinkTime),
    "2": (game, color, thinkTime) => new chessAI_v2(game, color, thinkTime),
    "3": (game, color, thinkTime) => new chessAI_v3(game, color, thinkTime),
};

export function setVersion(game: Chess, version: string, allowedThinkTime: number, color: string) {
    const createBot = aiVersions[version];
    if (!createBot) {
      console.error("Invalid version:", version);
      return null;
    }
    return createBot(game, color as Color, allowedThinkTime);
}