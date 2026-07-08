import { Controller, Get, Put, Body, Query, Request } from '@nestjs/common';
import { DailyRitualService, UpdateDailyRitualDto } from './daily-ritual.service';

@Controller('daily-ritual')
export class DailyRitualController {
  constructor(private readonly service: DailyRitualService) {}

  @Get()
  async get(@Request() req: any, @Query('date') date?: string) {
    return this.service.getForDate(req.user.id, date);
  }

  @Put()
  async update(@Request() req: any, @Body() dto: UpdateDailyRitualDto) {
    return this.service.upsert(req.user.id, dto);
  }
}
