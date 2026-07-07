import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'wtm0134@gmail.com' },
    include: {
      goals: { take: 3 },
      tasks: { take: 3 },
      plans: { take: 2 },
    },
  });
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
