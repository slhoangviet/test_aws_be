import { Injectable } from '@nestjs/common';
import { GameRepository } from './game.repository';
import type { CellValue, Room } from './types';

@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  checkWin(
    board: CellValue[][],
    x: number,
    y: number,
    symbol: 'X' | 'O',
  ): { x: number; y: number }[] | null {
    const directions = [
      { dx: 1, dy: 0 },   // horizontal
      { dx: 0, dy: 1 },   // vertical
      { dx: 1, dy: 1 },   // diagonal \
      { dx: 1, dy: -1 },  // diagonal /
    ];

    const size = board.length;

    for (const { dx, dy } of directions) {
      const line: { x: number; y: number }[] = [{ x, y }];

      // Check in positive direction
      let nx = x + dx;
      let ny = y + dy;
      while (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === symbol) {
        line.push({ x: nx, y: ny });
        nx += dx;
        ny += dy;
      }

      // Check in negative direction
      nx = x - dx;
      ny = y - dy;
      while (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === symbol) {
        line.unshift({ x: nx, y: ny });
        nx -= dx;
        ny -= dy;
      }

      if (line.length >= 5) {
        return line.slice(0, 5);
      }
    }

    return null;
  }

  checkDraw(board: CellValue[][]): boolean {
    for (const row of board) {
      for (const cell of row) {
        if (cell === null) return false;
      }
    }
    return true;
  }

  async saveGame(room: Room): Promise<void> {
    try {
      await this.gameRepository.create({
        roomCode: room.code,
        boardSize: room.boardSize,
        winner: room.winner,
        moves: room.moves,
        createdAt: room.createdAt,
        finishedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }
}
