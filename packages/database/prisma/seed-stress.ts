/**
 * Stress-test seed for a single production user.
 * Usage: TARGET_EMAIL=wtm0134@gmail.com pnpm db:seed:stress
 */
import {
  PlanStatus,
  Prisma,
  PrismaClient,
  SubscriptionTier,
} from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = process.env.TARGET_EMAIL ?? 'wtm0134@gmail.com';

// ~2 years back + 6 months forward from Jul 2026
const RANGE_START = new Date('2024-01-01T00:00:00.000Z');
const RANGE_END = new Date('2027-01-01T00:00:00.000Z');
const TODAY = new Date('2026-07-07T12:00:00.000Z');

const GOAL_DEFS = [
  {
    title: 'Master TypeScript & system design',
    description: 'Deepen engineering skills for senior-level interviews and shipping',
    emoji: '💻',
    color: '#3B82F6',
    frequencyPerWeek: 4,
    durationMinutes: 90,
    priority: 9,
    project: 'Career Growth',
  },
  {
    title: 'Strength training & cardio',
    description: '3x gym, 2x runs — build consistent fitness habit',
    emoji: '💪',
    color: '#EF4444',
    frequencyPerWeek: 5,
    durationMinutes: 60,
    priority: 8,
    project: 'Health & Wellness',
  },
  {
    title: 'Read 24 books this year',
    description: 'Non-fiction + one novel per month',
    emoji: '📚',
    color: '#8B5CF6',
    frequencyPerWeek: 3,
    durationMinutes: 45,
    priority: 6,
    project: 'Creative Life',
  },
  {
    title: 'Daily mindfulness & meditation',
    description: '10–20 min sessions to reduce stress and improve focus',
    emoji: '🧘',
    color: '#10B981',
    frequencyPerWeek: 7,
    durationMinutes: 20,
    priority: 7,
    project: 'Health & Wellness',
  },
  {
    title: 'Ship MicroSaaS side project',
    description: 'MVP, landing page, first 10 paying users',
    emoji: '🚀',
    color: '#F59E0B',
    frequencyPerWeek: 4,
    durationMinutes: 120,
    priority: 10,
    project: 'Career Growth',
  },
  {
    title: 'Guitar practice',
    description: 'Scales, songs, 30 min daily when possible',
    emoji: '🎸',
    color: '#EC4899',
    frequencyPerWeek: 4,
    durationMinutes: 30,
    priority: 5,
    project: 'Creative Life',
  },
  {
    title: 'Quality family time',
    description: 'Undistracted evenings and weekend activities',
    emoji: '👨‍👩‍👧',
    color: '#06B6D4',
    frequencyPerWeek: 3,
    durationMinutes: 90,
    priority: 9,
    project: 'Home & Family',
  },
  {
    title: 'Reflective journaling',
    description: 'Morning pages or evening recap — clarity and gratitude',
    emoji: '📝',
    color: '#6366F1',
    frequencyPerWeek: 5,
    durationMinutes: 25,
    priority: 6,
    project: 'Creative Life',
  },
] as const;

const PROJECT_DEFS = [
  { name: 'Career Growth', color: '#3B82F6', icon: '💼' },
  { name: 'Health & Wellness', color: '#10B981', icon: '🌿' },
  { name: 'Creative Life', color: '#8B5CF6', icon: '🎨' },
  { name: 'Home & Family', color: '#06B6D4', icon: '🏠' },
] as const;

const SESSION_LABELS: Record<string, string[]> = {
  'Master TypeScript & system design': [
    'Algorithms drill',
    'System design study',
    'Refactor legacy module',
    'Write technical blog post',
    'Pair on architecture review',
  ],
  'Strength training & cardio': [
    'Upper body workout',
    'Lower body workout',
    '5K run',
    'Mobility & stretch',
    'HIIT session',
  ],
  'Read 24 books this year': [
    'Read chapter block',
    'Book club notes',
    'Audiobook commute',
  ],
  'Daily mindfulness & meditation': [
    'Morning meditation',
    'Breathwork session',
    'Evening wind-down',
  ],
  'Ship MicroSaaS side project': [
    'Feature implementation',
    'User interview',
    'Marketing copy',
    'Deploy & monitor',
    'Bug bash',
  ],
  'Guitar practice': ['Scales & technique', 'Learn new song', 'Jam session'],
  'Quality family time': ['Family dinner', 'Weekend outing', 'Game night'],
  'Reflective journaling': ['Morning pages', 'Weekly review', 'Gratitude log'],
};

const TAG_POOL = [
  'deep-work',
  'quick-win',
  'meeting-prep',
  'learning',
  'health',
  'creative',
  'family',
  'urgent',
  'blocked',
  'recurring',
];

const TIME_SLOTS = [
  { start: '07:00', end: '08:00', duration: 60 },
  { start: '08:30', end: '09:30', duration: 60 },
  { start: '09:00', end: '10:30', duration: 90 },
  { start: '10:00', end: '11:00', duration: 60 },
  { start: '11:30', end: '12:30', duration: 60 },
  { start: '13:00', end: '14:00', duration: 60 },
  { start: '14:00', end: '15:30', duration: 90 },
  { start: '15:00', end: '16:00', duration: 60 },
  { start: '16:30', end: '17:30', duration: 60 },
  { start: '18:00', end: '19:00', duration: 60 },
  { start: '19:30', end: '20:30', duration: 60 },
  { start: '20:00', end: '21:00', duration: 60 },
];

let idSeq = 0;
function makeId(prefix: string) {
  idSeq += 1;
  return `seed${prefix}${idSeq.toString(36).padStart(6, '0')}`;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

function shouldComplete(scheduledDate: Date): boolean {
  if (scheduledDate > TODAY) return false;
  const daysAgo = (TODAY.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo > 90) return Math.random() < 0.92;
  if (daysAgo > 14) return Math.random() < 0.75;
  return Math.random() < 0.35;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function wipeUserData(userId: string) {
  console.log('Clearing existing goals, tasks, plans, and related data…');
  await prisma.task.deleteMany({ where: { userId } });
  await prisma.weeklyPlan.deleteMany({ where: { userId } });
  await prisma.goal.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });
  await prisma.productivityScore.deleteMany({ where: { userId } });
  await prisma.analyticsEvent.deleteMany({ where: { userId } });
  await prisma.smartNotification.deleteMany({ where: { userId } });
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) {
    throw new Error(`User not found: ${TARGET_EMAIL}`);
  }

  console.log(`Seeding stress data for ${user.email} (${user.id})…`);
  await wipeUserData(user.id);

  const projects = await Promise.all(
    PROJECT_DEFS.map((p) =>
      prisma.project.create({
        data: {
          id: makeId('prj'),
          userId: user.id,
          name: p.name,
          description: `${p.name} — long-term focus area`,
          color: p.color,
          icon: p.icon,
          startDate: RANGE_START,
          targetDate: RANGE_END,
        },
      })
    )
  );
  const projectByName = Object.fromEntries(projects.map((p) => [p.name, p]));

  const goals = await Promise.all(
    GOAL_DEFS.map((g, i) =>
      prisma.goal.create({
        data: {
          id: makeId('goal'),
          userId: user.id,
          projectId: projectByName[g.project]?.id,
          title: g.title,
          description: g.description,
          emoji: g.emoji,
          color: g.color,
          frequencyPerWeek: g.frequencyPerWeek,
          durationMinutes: g.durationMinutes,
          priority: g.priority,
          preferredTimes: i % 2 === 0 ? ['morning'] : ['afternoon', 'evening'],
          flexibilityScore: 4 + (i % 5),
          completionRate: 55 + (i % 30),
          totalCompletions: 80 + i * 17,
          totalScheduled: 120 + i * 22,
          currentStreak: 3 + (i % 12),
          longestStreak: 14 + i * 3,
          lastCompletedAt: addDays(TODAY, -(i + 1)),
        },
      })
    )
  );

  const taskRows: Prisma.TaskCreateManyInput[] = [];
  const parentCandidates: { id: string; scheduledDate: Date }[] = [];
  let taskCounter = 0;

  for (let d = new Date(RANGE_START); d < RANGE_END; d = addDays(d, 1)) {
    const weekday = isWeekday(d);
    const tasksToday = weekday ? 6 + (d.getUTCDate() % 3) : 1 + (d.getUTCDate() % 2);
    if (!weekday && d.getUTCDay() === 0 && d.getUTCDate() % 2 === 0) continue;

    for (let t = 0; t < tasksToday; t++) {
      const goal = pick(goals, taskCounter + d.getUTCDate());
      const slot = pick(TIME_SLOTS, taskCounter + t);
      const labels = SESSION_LABELS[goal.title] ?? ['Session'];
      const label = pick(labels, taskCounter);
      const completed = shouldComplete(d);
      const taskId = makeId('tsk');
      const withSubtasks = taskCounter % 17 === 0;

      taskRows.push({
        id: taskId,
        userId: user.id,
        goalId: goal.id,
        projectId: goal.projectId,
        title: `${goal.title.split(' ')[0]} — ${label}`,
        notes: taskCounter % 5 === 0 ? `Focused session for ${goal.title.toLowerCase()}.` : null,
        priority: (taskCounter % 3) + 1,
        tags: [pick(TAG_POOL, taskCounter), ...(taskCounter % 4 === 0 ? [pick(TAG_POOL, taskCounter + 3)] : [])],
        scheduledDate: new Date(d),
        startTime: slot.start,
        endTime: slot.end,
        durationMinutes: slot.duration,
        isCompleted: completed,
        completedAt: completed ? addDays(d, 0) : null,
        aiGenerated: taskCounter % 3 !== 0,
        manuallyAdded: taskCounter % 11 === 0,
        manuallyMoved: taskCounter % 23 === 0,
        aiReasoning:
          taskCounter % 4 === 0
            ? 'Scheduled during afternoon peak based on energy pattern.'
            : null,
        timeSpentMinutes: completed ? Math.max(15, slot.duration - (taskCounter % 20)) : 0,
        syncStatus: 'PENDING',
        createdAt: d,
        updatedAt: d,
      });

      if (withSubtasks) parentCandidates.push({ id: taskId, scheduledDate: d });
      taskCounter += 1;
    }
  }

  console.log(`Inserting ${taskRows.length} tasks in batches…`);
  for (const batch of chunk(taskRows, 800)) {
    await prisma.task.createMany({ data: batch });
  }

  const subtaskRows: Prisma.TaskCreateManyInput[] = [];
  for (const parent of parentCandidates.slice(0, 180)) {
    const parentTask = taskRows.find((t) => t.id === parent.id);
    if (!parentTask) continue;
    const steps = ['Prep & setup', 'Core work block', 'Review & notes'];
    let offset = 0;
    for (const step of steps) {
      const startHour = parseInt((parentTask.startTime as string).split(':')[0], 10);
      const startMin = offset;
      const endMin = offset + 20;
      subtaskRows.push({
        id: makeId('sub'),
        userId: user.id,
        goalId: parentTask.goalId,
        projectId: parentTask.projectId,
        parentTaskId: parent.id,
        title: step,
        scheduledDate: parent.scheduledDate,
        startTime: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
        endTime: `${String(startHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
        durationMinutes: 20,
        isCompleted: parentTask.isCompleted ? offset < 40 : false,
        completedAt: parentTask.isCompleted && offset < 40 ? parent.scheduledDate : null,
        aiGenerated: true,
        priority: 2,
        tags: ['subtask'],
        syncStatus: 'PENDING',
      });
      offset += 20;
    }
  }
  if (subtaskRows.length) {
    console.log(`Inserting ${subtaskRows.length} subtasks…`);
    for (const batch of chunk(subtaskRows, 500)) {
      await prisma.task.createMany({ data: batch });
    }
  }

  const topLevelIds = taskRows.map((t) => t.id as string);
  const depRows: Prisma.TaskDependencyCreateManyInput[] = [];
  for (let i = 0; i < 120; i++) {
    const blocker = topLevelIds[(i * 37) % topLevelIds.length];
    const dependent = topLevelIds[(i * 37 + 11) % topLevelIds.length];
    if (blocker === dependent) continue;
    depRows.push({
      id: makeId('dep'),
      dependentTaskId: dependent,
      blockingTaskId: blocker,
      type: i % 5 === 0 ? 'BLOCKED_BY' : 'BLOCKS',
    });
  }
  console.log(`Inserting ${depRows.length} task dependencies…`);
  await prisma.taskDependency.createMany({ data: depRows, skipDuplicates: true });

  const planRows: Prisma.WeeklyPlanCreateManyInput[] = [];
  for (let w = new Date(RANGE_START); w < TODAY; w = addDays(w, 7)) {
    const weekStart = startOfWeekMonday(w);
    const weekEnd = addDays(weekStart, 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    const weekTasks = taskRows.filter((t) => {
      const sd = t.scheduledDate as Date;
      return sd >= weekStart && sd <= weekEnd;
    });

    const isRecent = weekStart > addDays(TODAY, -21);
    const status: PlanStatus = isRecent ? PlanStatus.DRAFT : weekStart > addDays(TODAY, -90) ? PlanStatus.ACCEPTED : PlanStatus.ARCHIVED;
    const completedInWeek = weekTasks.filter((t) => t.isCompleted).length;

    planRows.push({
      id: makeId('plan'),
      userId: user.id,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      planJson: {
        title: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`,
        tasks: weekTasks.slice(0, 25).map((t) => ({
          goalId: t.goalId,
          title: t.title,
          notes: t.notes,
          scheduledDate: (t.scheduledDate as Date).toISOString(),
          startTime: t.startTime,
          endTime: t.endTime,
          durationMinutes: t.durationMinutes,
          aiGenerated: t.aiGenerated,
        })),
      },
      status,
      acceptedAt: status !== PlanStatus.DRAFT ? addDays(weekStart, 1) : null,
      appliedAt: status === PlanStatus.ARCHIVED ? addDays(weekStart, 2) : null,
      archivedAt: status === PlanStatus.ARCHIVED ? addDays(weekEnd, 3) : null,
      aiModel: weekStart.getUTCFullYear() >= 2025 ? 'gpt-4o-mini' : 'rule-based',
      complexity: 'standard',
      generationTime: 1.2 + (weekStart.getUTCMonth() % 3) * 0.4,
      generationCost: weekStart.getUTCFullYear() >= 2025 ? 0.8 : 0,
      tokenUsage: weekStart.getUTCFullYear() >= 2025 ? 3200 : 0,
      qualityScore: 72 + (weekStart.getUTCMonth() % 20),
      totalTasks: weekTasks.length,
      completedTasks: completedInWeek,
      completionRate: weekTasks.length ? (completedInWeek / weekTasks.length) * 100 : 0,
      createdAt: weekStart,
      updatedAt: weekStart,
    });
  }

  console.log(`Inserting ${planRows.length} weekly plans…`);
  for (const batch of chunk(planRows, 100)) {
    await prisma.weeklyPlan.createMany({ data: batch });
  }

  const scoreRows: Prisma.ProductivityScoreCreateManyInput[] = [];
  for (let i = 0; i < 365; i++) {
    const date = addDays(TODAY, -i);
    if (date < RANGE_START) break;
    const dayTasks = taskRows.filter(
      (t) => (t.scheduledDate as Date).toDateString() === date.toDateString()
    );
    const completed = dayTasks.filter((t) => t.isCompleted).length;
    const total = dayTasks.length || 1;
    const completionScore = Math.round((completed / total) * 100);
    scoreRows.push({
      id: makeId('scr'),
      userId: user.id,
      date,
      overallScore: Math.min(98, 55 + completionScore / 2 + (i % 15)),
      focusTimeScore: 60 + (i % 30),
      taskCompletionScore: completionScore,
      meetingEfficiencyScore: 70 + (i % 20),
      workLifeBalanceScore: 65 + (i % 25),
      totalFocusMinutes: 90 + (i % 120),
      totalMeetingMinutes: 30 + (i % 90),
      totalTaskMinutes: 180 + (i % 200),
      totalBreakMinutes: 45 + (i % 30),
      insights: ['Strong afternoon focus block', 'Consider shorter meetings on Wednesdays'],
      recommendations: ['Protect 2pm–4pm for deep work', 'Batch admin tasks on Fridays'],
    });
  }
  console.log(`Inserting ${scoreRows.length} productivity scores…`);
  for (const batch of chunk(scoreRows, 200)) {
    await prisma.productivityScore.createMany({ data: batch });
  }

  const analyticsRows: Prisma.AnalyticsEventCreateManyInput[] = [];
  const events = ['task_completed', 'plan_generated', 'goal_viewed', 'calendar_opened', 'task_created'];
  for (let i = 0; i < 500; i++) {
    analyticsRows.push({
      id: makeId('evt'),
      userId: user.id,
      event: pick(events, i),
      properties: { source: 'web', sample: true },
      platform: 'web',
      userTier: 'PRO',
      timestamp: addDays(TODAY, -(i % 180)),
    });
  }
  await prisma.analyticsEvent.createMany({ data: analyticsRows });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      tier: SubscriptionTier.PRO,
      activeGoalsCount: goals.length,
      onboardingCompleted: true,
      plansCreatedThisWeek: 1,
      tasksCreatedToday: 8,
      focusAreas: ['CAREER', 'LEARNING', 'HEALTH', 'FAMILY', 'HOBBIES'],
    },
  });

  const summary = {
    email: TARGET_EMAIL,
    goals: goals.length,
    projects: projects.length,
    tasks: taskRows.length,
    subtasks: subtaskRows.length,
    dependencies: depRows.length,
    weeklyPlans: planRows.length,
    productivityScores: scoreRows.length,
    analyticsEvents: analyticsRows.length,
    dateRange: {
      from: RANGE_START.toISOString().slice(0, 10),
      to: RANGE_END.toISOString().slice(0, 10),
    },
    tier: 'PRO',
  };

  console.log('\n✅ Stress seed complete:\n', JSON.stringify(summary, null, 2));
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
