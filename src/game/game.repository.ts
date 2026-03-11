import { Injectable } from '@nestjs/common';
import { getPool } from '../database/connection';
import type { GameRecord } from './types';

@Injectable()
export class GameRepository {
  async create(game: GameRecord): Promise<GameRecord> {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO games (room_code, board_size, winner, moves, created_at, finished_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        game.roomCode,
        game.boardSize,
        game.winner,
        JSON.stringify(game.moves),
        game.createdAt,
        game.finishedAt,
      ],
    );

    const insertResult = result as { insertId: number };
    return { ...game, id: insertResult.insertId };
  }

  async findAll(): Promise<GameRecord[]> {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, room_code as roomCode, board_size as boardSize, winner, moves, created_at as createdAt, finished_at as finishedAt
       FROM games ORDER BY created_at DESC LIMIT 100`,
    );

    return (rows as GameRecord[]).map((row) => ({
      ...row,
      moves: typeof row.moves === 'string' ? JSON.parse(row.moves) : row.moves,
    }));
  }

  async findById(id: number): Promise<GameRecord | null> {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, room_code as roomCode, board_size as boardSize, winner, moves, created_at as createdAt, finished_at as finishedAt
       FROM games WHERE id = ?`,
      [id],
    );

    const results = rows as GameRecord[];
    if (results.length === 0) return null;

    const row = results[0];
    return {
      ...row,
      moves: typeof row.moves === 'string' ? JSON.parse(row.moves) : row.moves,
    };
  }
}
