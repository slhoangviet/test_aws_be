import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../database/connection';
import {
  type FileRecord,
  type FileRecordRow,
  ensureFilesTable,
  FILES_TABLE,
} from './file.schema';

export type { FileRecord, FileRecordRow } from './file.schema';

export class FileRepository {
  async create(input: Omit<FileRecordRow, 'id' | 'createdAt'>): Promise<FileRecordRow> {
    const conn = getPool();
    await ensureFilesTable(conn);

    const [result] = await conn.execute<ResultSetHeader>(
      `
        INSERT INTO ${FILES_TABLE} (original_name, mime_type, size, s3_key)
        VALUES (?, ?, ?, ?)
      `,
      [input.originalName, input.mimeType, input.size, input.s3Key],
    );

    const id = Number(result.insertId);
    return {
      id,
      ...input,
      createdAt: new Date(),
    };
  }

  async findAll(): Promise<FileRecordRow[]> {
    const conn = getPool();
    await ensureFilesTable(conn);

    const [rows] = await conn.query<
      (RowDataPacket & {
        id: number;
        original_name: string;
        mime_type: string;
        size: number;
        s3_key: string;
        created_at: Date;
      })[]
    >(
      `
        SELECT
          id,
          original_name,
          mime_type,
          size,
          s3_key,
          created_at
        FROM ${FILES_TABLE}
        ORDER BY created_at DESC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      s3Key: row.s3_key,
      createdAt: row.created_at,
    }));
  }

  async findById(id: number): Promise<FileRecordRow | null> {
    const conn = getPool();
    await ensureFilesTable(conn);

    const [rows] = await conn.query<
      (RowDataPacket & {
        id: number;
        original_name: string;
        mime_type: string;
        size: number;
        s3_key: string;
        created_at: Date;
      })[]
    >(
      `SELECT id, original_name, mime_type, size, s3_key, created_at FROM ${FILES_TABLE} WHERE id = ?`,
      [id],
    );

    if (!rows?.length) return null;
    const row = rows[0];
    return {
      id: row.id,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      s3Key: row.s3_key,
      createdAt: row.created_at,
    };
  }

  async deleteById(id: number): Promise<void> {
    const conn = getPool();
    await ensureFilesTable(conn);
    await conn.execute(`DELETE FROM ${FILES_TABLE} WHERE id = ?`, [id]);
  }
}
