import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TripAccessGuard } from '@/common/guards/trip-access.guard';

@Global()
@Module({
  providers: [PrismaService, TripAccessGuard],
  exports: [PrismaService, TripAccessGuard],
})
export class PrismaModule {}
