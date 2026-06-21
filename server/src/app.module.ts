import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TripModule } from './modules/trip/trip.module';
import { MemberModule } from './modules/member/member.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { StatsModule } from './modules/stats/stats.module';
import { ActivityModule } from './modules/activity/activity.module';
import { FileModule } from './modules/file/file.module';
import { TemplateModule } from './modules/template/template.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    TripModule,
    MemberModule,
    ExpenseModule,
    VehicleModule,
    SettlementModule,
    StatsModule,
    ActivityModule,
    FileModule,
    TemplateModule,
  ],
})
export class AppModule {}
