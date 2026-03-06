import type { Pool } from 'mysql2/promise';

export const FILES_TABLE = 'files' as const;

/** Bản ghi trả ra API (có s3Url do gen on-demand). */
export interface FileRecord {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url: string;
  createdAt: Date;
}

/** Bản ghi trong DB (không lưu s3_url, gen từ s3_key khi list). */
export type FileRecordRow = Omit<FileRecord, 's3Url'>;

const CREATE_FILES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ${FILES_TABLE} (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    s3_key VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

let ensured = false;

export async function ensureFilesTable(conn: Pool): Promise<void> {
  if (ensured) return;
  await conn.query(CREATE_FILES_TABLE_SQL);
  ensured = true;
}
