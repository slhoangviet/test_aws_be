import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { RoomManager } from './room.manager';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly roomManager: RoomManager,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const room = this.roomManager.getRoomByPlayer(client.id);
    if (room) {
      this.roomManager.removePlayer(room.code, client.id);
      this.server.to(room.code).emit('player_left', { playerId: client.id });
      
      if (room.players.size === 0) {
        this.roomManager.deleteRoom(room.code);
      }
    }
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardSize?: number },
  ) {
    const boardSize = data?.boardSize || 15;
    const room = this.roomManager.createRoom(boardSize);
    const symbol = this.roomManager.addPlayer(room.code, client.id);

    if (!symbol) {
      return { error: 'Failed to create room' };
    }

    client.join(room.code);
    client.emit('room_created', {
      roomCode: room.code,
      boardSize: room.boardSize,
      symbol,
    });

    return { success: true, roomCode: room.code };
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    const roomCode = data?.roomCode?.toUpperCase();
    if (!roomCode) {
      return { error: 'Room code is required' };
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      client.emit('error', { message: 'Room not found' });
      return { error: 'Room not found' };
    }

    if (room.players.size >= 2) {
      client.emit('error', { message: 'Room is full' });
      return { error: 'Room is full' };
    }

    const symbol = this.roomManager.addPlayer(roomCode, client.id);
    if (!symbol) {
      client.emit('error', { message: 'Failed to join room' });
      return { error: 'Failed to join room' };
    }

    client.join(roomCode);

    this.server.to(roomCode).emit('player_joined', {
      playerId: client.id,
      symbol,
      playerCount: room.players.size,
      roomCode: room.code,
      boardSize: room.boardSize,
    });

    if (room.players.size === 2) {
      // Gửi danh sách players để mỗi client tự tìm symbol của mình
      const players: Record<string, 'X' | 'O'> = {};
      for (const [pid, sym] of room.players.entries()) {
        players[pid] = sym;
      }
      this.server.to(roomCode).emit('game_start', {
        board: room.board,
        boardSize: room.boardSize,
        currentTurn: room.currentTurn,
        roomCode: room.code,
        players,
      });
    }

    return { success: true, symbol, boardSize: room.boardSize };
  }

  @SubscribeMessage('make_move')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { x: number; y: number },
  ) {
    const room = this.roomManager.getRoomByPlayer(client.id);
    if (!room) {
      return { error: 'Not in a room' };
    }

    const playerSymbol = room.players.get(client.id);
    if (!playerSymbol) {
      return { error: 'Not a player in this game' };
    }

    if (room.winner) {
      return { error: 'Game already ended' };
    }

    if (room.currentTurn !== playerSymbol) {
      return { error: 'Not your turn' };
    }

    const { x, y } = data;
    if (x < 0 || x >= room.boardSize || y < 0 || y >= room.boardSize) {
      return { error: 'Invalid position' };
    }

    if (room.board[y][x] !== null) {
      return { error: 'Cell already occupied' };
    }

    room.board[y][x] = playerSymbol;
    room.moves.push({ x, y, symbol: playerSymbol, timestamp: Date.now() });

    const winResult = this.gameService.checkWin(room.board, x, y, playerSymbol);

    if (winResult) {
      room.winner = playerSymbol;
      room.winLine = winResult;

      this.server.to(room.code).emit('move_made', {
        x,
        y,
        symbol: playerSymbol,
        board: room.board,
      });

      this.server.to(room.code).emit('game_over', {
        winner: playerSymbol,
        line: winResult,
      });

      await this.gameService.saveGame(room);
      return { success: true };
    }

    const isDraw = this.gameService.checkDraw(room.board);
    if (isDraw) {
      room.winner = 'draw';

      this.server.to(room.code).emit('move_made', {
        x,
        y,
        symbol: playerSymbol,
        board: room.board,
      });

      this.server.to(room.code).emit('game_over', {
        winner: 'draw',
        line: null,
      });

      await this.gameService.saveGame(room);
      return { success: true };
    }

    room.currentTurn = playerSymbol === 'X' ? 'O' : 'X';

    this.server.to(room.code).emit('move_made', {
      x,
      y,
      symbol: playerSymbol,
      board: room.board,
      currentTurn: room.currentTurn,
    });

    return { success: true };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const room = this.roomManager.getRoomByPlayer(client.id);
    if (!room) {
      return { error: 'Not in a room' };
    }

    this.roomManager.removePlayer(room.code, client.id);
    client.leave(room.code);

    this.server.to(room.code).emit('player_left', { playerId: client.id });

    if (room.players.size === 0) {
      this.roomManager.deleteRoom(room.code);
    }

    return { success: true };
  }

  @SubscribeMessage('restart_game')
  handleRestartGame(@ConnectedSocket() client: Socket) {
    const room = this.roomManager.getRoomByPlayer(client.id);
    if (!room) {
      return { error: 'Not in a room' };
    }

    if (room.players.size !== 2) {
      return { error: 'Need 2 players to restart' };
    }

    this.roomManager.resetRoom(room.code);

    const players: Record<string, 'X' | 'O'> = {};
    for (const [pid, sym] of room.players.entries()) {
      players[pid] = sym;
    }

    this.server.to(room.code).emit('game_start', {
      board: room.board,
      boardSize: room.boardSize,
      currentTurn: room.currentTurn,
      roomCode: room.code,
      players,
    });

    return { success: true };
  }
}
