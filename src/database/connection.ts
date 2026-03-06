import mysql, { type Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export function getPool(): Pool {
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
