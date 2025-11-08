import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}
}
