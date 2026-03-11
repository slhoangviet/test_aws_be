import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { RoomManager } from './room.manager';
import { GameRepository } from './game.repository';

@Module({
  providers: [GameGateway, GameService, RoomManager, GameRepository],
  exports: [GameService],
})
export class GameModule {}
