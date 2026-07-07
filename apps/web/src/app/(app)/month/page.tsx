import { redirect } from 'next/navigation';

export default function MonthRedirectPage() {
  redirect('/week?view=month');
}
