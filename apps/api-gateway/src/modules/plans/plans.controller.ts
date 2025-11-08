import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate weekly plan using AI' })
  async generatePlan(@Body() generatePlanDto: any) {
    return this.plansService.generatePlan(generatePlanDto);
  }
}
