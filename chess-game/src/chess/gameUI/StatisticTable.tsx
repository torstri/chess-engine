import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Player } from "../utils/Types";

interface StatisticTableProps {
  whiteWins: number;
  blackWins: number;
  draws: number;
  gamesPlayed: number;
}

export function StatisticTable({
  whiteWins,
  blackWins,
  draws,
  gamesPlayed,
}: StatisticTableProps): JSX.Element {
  function getWinRate(color: string): number {
    if (color == Player.White) {
      return Math.round((whiteWins / (whiteWins + blackWins + draws)) * 100);
    } else {
      return Math.round((blackWins / (whiteWins + blackWins + draws)) * 100);
    }
  }
  return (
    <>
      <span style={{ padding: "10px" }}>Games Played: {gamesPlayed}</span>
      <TableContainer component={Paper} sx={{ width: "800px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Wins</TableCell>
              <TableCell align="right">Draws</TableCell>
              <TableCell align="right">Losses</TableCell>
              <TableCell align="right">Win Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>White</TableCell>
              <TableCell align="right">{whiteWins}</TableCell>
              <TableCell align="right">{draws}</TableCell>
              <TableCell align="right">{blackWins}</TableCell>
              <TableCell align="right">
                {whiteWins + blackWins + draws != 0
                  ? getWinRate(Player.White)
                  : 0}
                %
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Black</TableCell>
              <TableCell align="right">{blackWins}</TableCell>
              <TableCell align="right">{draws}</TableCell>
              <TableCell align="right">{whiteWins}</TableCell>
              <TableCell align="right">
                {whiteWins + blackWins + draws != 0
                  ? getWinRate(Player.Black)
                  : 0}
                %
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
