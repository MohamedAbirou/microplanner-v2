import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}
}
