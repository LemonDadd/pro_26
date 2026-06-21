import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service';
import { ApplyTemplateDto } from '@/modules/trip/dto/trip.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@Controller()
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get('templates')
  async list(
    @Query('tag') tag?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.templateService.list({
      tag,
      keyword,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }

  @Get('templates/:id')
  async detail(@Param('id') id: string) {
    return this.templateService.detail(id);
  }

  @Post('templates/:id/apply')
  @UseGuards(JwtAuthGuard)
  async apply(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ApplyTemplateDto,
  ) {
    return this.templateService.apply(id, user.userId, dto);
  }
}
