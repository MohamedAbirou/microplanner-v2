import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);
  private readonly planningServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    this.planningServiceUrl =
      this.configService.get('PLANNING_SERVICE_URL') || 'http://localhost:8000';
  }

  async generatePlan(data: any) {
    try {
      // Call Python FastAPI planning service
      const response = await firstValueFrom(
        this.httpService.post(`${this.planningServiceUrl}/api/v1/plans/generate`, data)
      );

      return response.data;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to generate plan: ${err.message}`);
      throw error;
    }
  }
}
