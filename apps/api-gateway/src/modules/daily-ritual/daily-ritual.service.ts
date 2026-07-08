import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface UpdateDailyRitualDto {
  date: string;
  intention?: string;
  reflection?: string;
  planCompleted?: boolean;
}

@Injectable()
export class DailyRitualService {
  constructor(private prisma: PrismaService) {}

  private startOfDay(dateStr?: string): Date {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async getForDate(userId: string, dateStr?: string) {
    const date = this.startOfDay(dateStr);
    return this.prisma.dailyRitual.findUnique({
      where: { userId_date: { userId, date } },
    });
  }

  async upsert(userId: string, dto: UpdateDailyRitualDto) {
    const date = this.startOfDay(dto.date);
    const data: any = {};
    if (dto.intention !== undefined) data.intention = dto.intention;
    if (dto.reflection !== undefined) data.reflection = dto.reflection;
    if (dto.planCompleted !== undefined) data.planCompleted = dto.planCompleted;

    return this.prisma.dailyRitual.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...data },
      update: data,
    });
  }
}
