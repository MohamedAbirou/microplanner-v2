import { redirect } from 'next/navigation';

type DayRedirectPageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DayRedirectPage({ searchParams }: DayRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams({ view: 'day' });
  if (params.date) query.set('date', params.date);
  redirect(`/week?${query.toString()}`);
}
