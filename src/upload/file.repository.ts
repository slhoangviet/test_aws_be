import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';

export interface FileRecord {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url: string;
  createdAt: Date;
}

let pool: Pool | null = null;
let ensured = false;

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'aws_user',
      password: process.env.DB_PASSWORD || 'aws_password',
      database: process.env.DB_NAME || 'aws_test_db',
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  return pool;
}

async function ensureTable() {
  if (ensured) return;

  const conn = getPool();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS files (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      size BIGINT NOT NULL,
      s3_key VARCHAR(512) NOT NULL,
      s3_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  ensured = true;
}

export class FileRepository {
  async create(input: Omit<FileRecord, 'id' | 'createdAt'>): Promise<FileRecord> {
    await ensureTable();
    const conn = getPool();

    const [result] = await conn.execute<ResultSetHeader>(
      `
        INSERT INTO files (original_name, mime_type, size, s3_key, s3_url)
        VALUES (?, ?, ?, ?, ?)
      `,
      [input.originalName, input.mimeType, input.size, input.s3Key, input.s3Url],
    );

    const id = Number(result.insertId);

    return {
      id,
      ...input,
      createdAt: new Date(),
    };
  }

  async findAll(): Promise<FileRecord[]> {
    await ensureTable();
    const conn = getPool();

    const [rows] = await conn.query<
      (RowDataPacket & {
        id: number;
        original_name: string;
        mime_type: string;
        size: number;
        s3_key: string;
        s3_url: string;
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
          s3_url,
          created_at
        FROM files
        ORDER BY created_at DESC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      s3Key: row.s3_key,
      s3Url: row.s3_url,
      createdAt: row.created_at,
    }));
  }
}

