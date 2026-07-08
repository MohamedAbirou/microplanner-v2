import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MemoryType } from '@microplanner/database';
import { PrismaService } from '../../database/prisma.service';
import { CreateAiMemoryDto } from './dto/create-ai-memory.dto';

@Injectable()
export class AiMemoryService {
  private readonly logger = new Logger(AiMemoryService.name);

  constructor(private prisma: PrismaService) {}

  /** List a user's AI memories (most confident / recently used first). */
  async findForUser(userId: string) {
    return this.prisma.aIMemory.findMany({
      where: { userId },
      orderBy: [{ confidence: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  /**
   * Create (or update) an explicit user override. Overrides are stored as
   * high-confidence memories sourced from the user themselves.
   */
  async create(userId: string, dto: CreateAiMemoryDto) {
    this.logger.log(`Storing ${dto.memoryType} memory for user ${userId}`);
    return this.prisma.aIMemory.create({
      data: {
        userId,
        memoryType: dto.memoryType,
        content: dto.content,
        confidence: dto.confidence ?? 1, // explicit overrides are fully trusted
        source: 'user-override',
      },
    });
  }

  /**
   * Record a scheduling override the user made (dismissed an autopilot move, or
   * smart-rescheduled a task). Stored as a moderate-confidence TIME_PREFERENCE
   * memory so future plans (Claude + GPT) learn the user's real preferences.
   */
  async recordRescheduleOverride(
    userId: string,
    input: { taskTitle?: string; preferredStart?: string; source: string; note?: string },
  ) {
    try {
      return await this.prisma.aIMemory.create({
        data: {
          userId,
          memoryType: MemoryType.TIME_PREFERENCE,
          content: { pattern: 'reschedule_override', ...input } as any,
          confidence: 0.6,
          source: input.source,
        },
      });
    } catch (err: any) {
      // Learning is best-effort — never let it break the reschedule action.
      this.logger.warn(`Failed to record reschedule override for ${userId}: ${err?.message || err}`);
      return null;
    }
  }

  async delete(userId: string, id: string) {
    const memory = await this.prisma.aIMemory.findFirst({ where: { id, userId } });
    if (!memory) throw new NotFoundException('Memory not found');
    await this.prisma.aIMemory.delete({ where: { id } });
    return true;
  }

  /**
   * Load the memories that should influence plan generation. Bumps use counters
   * so we can later prune stale, unused memories.
   */
  async getForPlanning(userId: string): Promise<
    { memoryType: MemoryType; content: unknown; confidence: number }[]
  > {
    const memories = await this.prisma.aIMemory.findMany({
      where: { userId, confidence: { gte: 0.4 } },
      orderBy: { confidence: 'desc' },
      take: 25,
    });

    if (memories.length > 0) {
      // Fire-and-forget usage bump; never block planning on it.
      this.prisma.aIMemory
        .updateMany({
          where: { id: { in: memories.map((m) => m.id) } },
          data: { useCount: { increment: 1 }, lastUsedAt: new Date() },
        })
        .catch((err) => this.logger.warn(`Failed to bump AI memory usage: ${err?.message}`));
    }

    return memories.map((m) => ({
      memoryType: m.memoryType,
      content: m.content,
      confidence: m.confidence,
    }));
  }
}
