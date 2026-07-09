/**
 * Resolves a local wall-clock date + "HH:mm" time in a given IANA timezone to
 * the UTC instant it represents (DST-aware, no external dependency).
 */
export function zonedDateTimeToUtc(dateOnly: Date, hhmm: string, timeZone: string): Date {
  const [hour, minute] = hhmm.split(':').map(Number);
  const year = dateOnly.getUTCFullYear();
  const month = dateOnly.getUTCMonth();
  const day = dateOnly.getUTCDate();

  // Naive instant using the desired wall-clock fields as if they were UTC.
  const naive = new Date(Date.UTC(year, month, day, hour, minute || 0, 0));

  // How far "naive" actually reads on the wall clock in `timeZone`, expressed
  // as a UTC-labelled instant with the same fields - the gap between the two
  // readings of the SAME instant is the zone's offset at that moment.
  const naiveInZone = new Date(naive.toLocaleString('en-US', { timeZone }));
  const naiveAsUtcLabel = new Date(naive.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMs = naiveAsUtcLabel.getTime() - naiveInZone.getTime();

  return new Date(naive.getTime() + offsetMs);
}
