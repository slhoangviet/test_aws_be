-- Caro Game Database Schema
-- Run this SQL to set up the database

CREATE DATABASE IF NOT EXISTS aws_test_db;
USE aws_test_db;

-- Drop old tables if exists
DROP TABLE IF EXISTS files;

-- Games table: lưu lịch sử các ván đấu
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  board_size INT NOT NULL DEFAULT 15,
  winner ENUM('X', 'O', 'draw') NULL,
  moves JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  INDEX idx_room_code (room_code),
  INDEX idx_created_at (created_at)
);
