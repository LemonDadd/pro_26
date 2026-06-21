import { Module } from '@nestjs/common';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { ActivityModule } from '@/modules/activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
