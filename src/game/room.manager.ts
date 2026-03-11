import { Injectable } from '@nestjs/common';
import type { Room, CellValue } from './types';

@Injectable()
export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerToRoom: Map<string, string> = new Map();

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  private createEmptyBoard(size: number): CellValue[][] {
    return Array.from({ length: size }, () => Array(size).fill(null));
  }

  createRoom(boardSize: number = 15): Room {
    const code = this.generateRoomCode();
    const room: Room = {
      code,
      boardSize: Math.min(Math.max(boardSize, 5), 20),
      board: this.createEmptyBoard(boardSize),
      players: new Map(),
      currentTurn: 'X',
      moves: [],
      winner: null,
      winLine: null,
      createdAt: new Date(),
    };
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getRoomByPlayer(playerId: string): Room | undefined {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return undefined;
    return this.rooms.get(roomCode);
  }

  addPlayer(roomCode: string, playerId: string): 'X' | 'O' | null {
    const room = this.rooms.get(roomCode);
    console.log(`[addPlayer] roomCode=${roomCode}, playerId=${playerId}, room exists=${!!room}, players.size=${room?.players.size}`);
    
    if (!room || room.players.size >= 2) return null;

    const existingRoom = this.playerToRoom.get(playerId);
    if (existingRoom) {
      console.log(`[addPlayer] Player was in room ${existingRoom}, removing`);
      this.removePlayer(existingRoom, playerId);
    }

    const symbol: 'X' | 'O' = room.players.size === 0 ? 'X' : 'O';
    room.players.set(playerId, symbol);
    this.playerToRoom.set(playerId, roomCode);
    
    console.log(`[addPlayer] Assigned ${symbol} to ${playerId}, new size=${room.players.size}`);
    console.log(`[addPlayer] All players:`, Object.fromEntries(room.players));

    return symbol;
  }

  removePlayer(roomCode: string, playerId: string): void {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.players.delete(playerId);
    }
    this.playerToRoom.delete(playerId);
  }

  deleteRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      for (const playerId of room.players.keys()) {
        this.playerToRoom.delete(playerId);
      }
      this.rooms.delete(code);
    }
  }

  resetRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      room.board = this.createEmptyBoard(room.boardSize);
      room.moves = [];
      room.winner = null;
      room.winLine = null;
      room.currentTurn = 'X';
    }
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}
