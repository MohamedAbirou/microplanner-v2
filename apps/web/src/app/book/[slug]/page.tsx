'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import { CalendarClock, Clock, MapPin, Loader2, CheckCircle2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  GET_SCHEDULING_LINK_BY_SLUG,
  GET_AVAILABLE_SLOTS,
  CREATE_BOOKING,
} from '@/graphql/operations-extended';

function isoStartTime(dateStr: string, slotStart: string): string {
  // Slot may already be a full ISO datetime, or just "HH:mm".
  if (slotStart.includes('T')) return new Date(slotStart).toISOString();
  return new Date(`${dateStr}T${slotStart}:00`).toISOString();
}

function slotLabel(slotStart: string): string {
  const d = slotStart.includes('T')
    ? new Date(slotStart)
    : new Date(`1970-01-01T${slotStart}:00`);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function BookingPage() {
  const params = useParams();
  const slug = String(params.slug);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const tomorrow = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return format(d, 'yyyy-MM-dd');
  }, []);
  const [date, setDate] = React.useState(tomorrow);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [confirmed, setConfirmed] = React.useState<any>(null);

  const { data: linkData, loading: linkLoading } = useQuery(GET_SCHEDULING_LINK_BY_SLUG, {
    variables: { slug },
    fetchPolicy: 'network-only',
  });
  const link = linkData?.schedulingLinkBySlug;

  const { data: slotsData, loading: slotsLoading } = useQuery(GET_AVAILABLE_SLOTS, {
    variables: { linkId: link?.id, date: new Date(`${date}T00:00:00`).toISOString() },
    skip: !link?.id,
    fetchPolicy: 'network-only',
  });
  const slots = slotsData?.availableSlots || [];

  const [createBooking, { loading: booking }] = useMutation(CREATE_BOOKING);

  const handleBook = async () => {
    if (!link?.id || !selectedSlot || !name.trim() || !email.trim()) return;
    try {
      const { data } = await createBooking({
        variables: {
          input: {
            linkId: link.id,
            attendeeName: name.trim(),
            attendeeEmail: email.trim(),
            startTime: isoStartTime(date, selectedSlot),
            timezone,
          },
        },
      });
      setConfirmed(data?.createBooking);
    } catch {
      /* error surfaced below */
    }
  };

  if (linkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Skeleton className="h-96 w-full max-w-lg rounded-[14px]" />
      </div>
    );
  }

  if (!link || !link.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-[14px] text-center">
          <CardContent className="py-12">
            <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">This scheduling link isn&apos;t available</p>
            <p className="text-[13px] text-muted-foreground mt-1">
              It may have been paused or removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-[14px]">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h2 className="text-xl font-semibold">Booking confirmed</h2>
            <p className="text-[13px] text-muted-foreground mt-1">
              {link.requiresConfirmation
                ? 'Your request has been sent and is awaiting confirmation.'
                : `You're booked with ${link.user?.name || 'your host'}.`}
            </p>
            <div className="mt-5 rounded-[10px] border border-border p-4 text-left">
              <div className="text-sm font-medium">{link.name}</div>
              <div className="text-[13px] text-muted-foreground mt-1">
                {format(new Date(confirmed.startTime), 'EEEE, MMM d · h:mm a')}
              </div>
              <div className="text-[13px] text-muted-foreground">{link.duration} minutes</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="max-w-2xl w-full rounded-[14px] shadow-[var(--sh-md)]">
        <CardHeader>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <User className="h-4 w-4" />
            {link.user?.name || 'MicroPlanner'}
          </div>
          <CardTitle className="text-xl">{link.name}</CardTitle>
          {link.description && (
            <CardDescription className="text-[13px]">{link.description}</CardDescription>
          )}
          <div className="flex items-center gap-4 mt-2 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {link.duration} min
            </span>
            {link.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {link.location}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Date + slots */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-date">Date</Label>
              <Input
                id="book-date"
                type="date"
                value={date}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Available times</Label>
              {slotsLoading ? (
                <Skeleton className="h-10 w-full rounded-[10px]" />
              ) : slots.length === 0 ? (
                <p className="text-[13px] text-muted-foreground pt-2">
                  No open times on this day. Try another date.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {slots.map((s: any) => (
                    <Button
                      key={s.start}
                      variant={selectedSlot === s.start ? 'default' : 'outline'}
                      size="sm"
                      className={cn('h-8 text-xs')}
                      onClick={() => setSelectedSlot(s.start)}
                    >
                      {slotLabel(s.start)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendee details */}
          {selectedSlot && (
            <div className="space-y-4 border-t border-border pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="book-name">Your name</Label>
                  <Input
                    id="book-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-email">Email</Label>
                  <Input
                    id="book-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleBook}
                disabled={!name.trim() || !email.trim() || booking}
              >
                {booking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm booking for {slotLabel(selectedSlot)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
