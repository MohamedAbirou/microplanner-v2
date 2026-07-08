import { Controller, Get, Post, Put, Body, Param, Request } from '@nestjs/common';
import { AutopilotService } from './autopilot.service';

@Controller('autopilot')
export class AutopilotController {
  constructor(private readonly autopilotService: AutopilotService) {}

  @Get('status')
  async getStatus(@Request() req: any) {
    return this.autopilotService.getStatus(req.user.id);
  }

  @Put('settings')
  async updateSettings(
    @Request() req: any,
    @Body() body: { enabled?: boolean; mode?: string },
  ) {
    return this.autopilotService.updateSettings(req.user.id, body);
  }

  @Post('run')
  async run(@Request() req: any, @Body() body: { date?: string }) {
    const date = body?.date ? new Date(body.date) : new Date();
    const proposal = await this.autopilotService.rescheduleDay(req.user.id, date, 'manual');
    return proposal ?? { moved: 0, message: 'Nothing to reschedule' };
  }

  @Post('proposals/:id/apply')
  async apply(@Request() req: any, @Param('id') id: string) {
    return this.autopilotService.applyProposal(id, req.user.id);
  }

  @Post('proposals/:id/dismiss')
  async dismiss(@Request() req: any, @Param('id') id: string) {
    return this.autopilotService.dismissProposal(id, req.user.id);
  }
}
