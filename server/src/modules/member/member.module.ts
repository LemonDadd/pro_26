import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { ActivityModule } from '@/modules/activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
