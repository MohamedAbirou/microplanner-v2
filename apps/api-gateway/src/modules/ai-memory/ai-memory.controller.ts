import type { User } from '@microplanner/database';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiMemoryService } from './ai-memory.service';
import { CreateAiMemoryDto } from './dto/create-ai-memory.dto';

@ApiTags('ai-memory')
@ApiBearerAuth()
@Controller('ai-memory')
export class AiMemoryController {
  constructor(private readonly aiMemoryService: AiMemoryService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user AI memories / overrides' })
  @ApiResponse({ status: 200, description: 'Memories retrieved' })
  async list(@CurrentUser() user: User) {
    return this.aiMemoryService.findForUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an explicit AI scheduling override' })
  @ApiResponse({ status: 201, description: 'Memory created' })
  async create(@CurrentUser() user: User, @Body() dto: CreateAiMemoryDto) {
    return this.aiMemoryService.create(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an AI memory / override' })
  @ApiResponse({ status: 200, description: 'Memory deleted' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    const ok = await this.aiMemoryService.delete(user.id, id);
    return { success: ok };
  }
}
