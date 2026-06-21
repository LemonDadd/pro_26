import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { MineController } from './mine.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [StatsController, MineController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
