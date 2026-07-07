import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'wtm0134@gmail.com' },
    select: {
      email: true,
      tier: true,
      activeGoalsCount: true,
      _count: {
        select: {
          goals: true,
          tasks: true,
          plans: true,
          projects: true,
          productivityScores: true,
        },
      },
    },
  });

  const byYear = await prisma.$queryRaw<{ year: number; count: bigint }[]>`
    SELECT EXTRACT(YEAR FROM "scheduledDate")::int AS year, COUNT(*)::bigint AS count
    FROM "Task"
    WHERE "userId" = (SELECT id FROM "User" WHERE email = 'wtm0134@gmail.com')
    GROUP BY 1
    ORDER BY 1
  `;

  const recent = await prisma.task.findMany({
    where: { user: { email: 'wtm0134@gmail.com' } },
    orderBy: { scheduledDate: 'desc' },
    take: 3,
    select: { title: true, scheduledDate: true, isCompleted: true, goal: { select: { emoji: true } } },
  });

  console.log('user', user);
  console.log('byYear', byYear.map((r) => ({ year: r.year, count: Number(r.count) })));
  console.log('recent', recent);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
