'use client';

import { UpgradeButton } from '@/components/upgrade-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTier } from '@/contexts/tier-context';
import {
  useBillingInfo,
  useBillingSubscription,
  useCancelSubscription,
  useCreateBillingPortalSession,
  useResumeSubscription,
  useUsageStats,
} from '@/hooks/use-graphql-extended';
import { formatTierLabel, getNextTier, getTierPrice } from '@/lib/upgrade';
import { CreditCard, Download, ExternalLink, Gauge, Receipt } from 'lucide-react';

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatMoney(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusVariant(status?: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
    case 'TRIALING':
      return 'default';
    case 'PAST_DUE':
    case 'UNPAID':
      return 'destructive';
    case 'CANCELED':
      return 'secondary';
    default:
      return 'outline';
  }
}

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  percent: number;
}

function UsageMeter({ label, used, limit, percent }: UsageMeterProps) {
  const unlimited = limit < 0;
  const value = unlimited ? 0 : Math.min(100, Math.max(0, percent));
  const nearLimit = !unlimited && value >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={nearLimit ? 'font-medium text-destructive' : 'font-medium'}>
          {used}
          {unlimited ? '' : ` / ${limit}`}
          {unlimited && <span className="ml-1 text-muted-foreground">(unlimited)</span>}
        </span>
      </div>
      {!unlimited && <Progress value={value} className={nearLimit ? '[&>div]:bg-destructive' : undefined} />}
    </div>
  );
}

export default function BillingPage() {
  const { tier } = useTier();
  const nextTier = getNextTier(tier);
  const isPaid = tier !== 'FREE';

  const { subscription, loading: subLoading } = useBillingSubscription();
  const { usage, loading: usageLoading } = useUsageStats();
  const { billingInfo, loading: billingLoading } = useBillingInfo({ skipQuery: !isPaid });
  const { createPortalSession, loading: portalLoading } = useCreateBillingPortalSession();
  const { cancelSubscription, loading: cancelLoading } = useCancelSubscription();
  const { resumeSubscription, loading: resumeLoading } = useResumeSubscription();

  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;
  const status = subscription?.status ?? (isPaid ? 'ACTIVE' : 'FREE');
  const paymentMethod = billingInfo?.paymentMethod;
  const invoices = billingInfo?.invoices ?? [];

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto mp-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage your subscription, usage, and invoices</p>
      </div>

      {/* Current plan */}
      <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
        <CardHeader>
          <CardTitle className="text-[15px] flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current plan
          </CardTitle>
          <CardDescription className="text-[13px]">Your active MicroPlanner subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatTierLabel(tier)}</div>
              <div className="text-sm text-muted-foreground">{getTierPrice(tier)}</div>
            </div>
            <Badge variant={statusVariant(status)}>{status}</Badge>
          </div>

          {isPaid && (
            <div className="text-[13px] text-muted-foreground">
              {cancelAtPeriodEnd ? (
                <span className="text-destructive">
                  Cancels on {formatDate(subscription?.currentPeriodEnd)} — access continues until then.
                </span>
              ) : subscription?.currentPeriodEnd ? (
                <span>Renews on {formatDate(subscription.currentPeriodEnd)}</span>
              ) : null}
            </div>
          )}

          {nextTier && (
            <UpgradeButton className="w-full" size="lg" targetTier={nextTier} showIcon={false}>
              Upgrade to {formatTierLabel(nextTier)} — {getTierPrice(nextTier)}
            </UpgradeButton>
          )}

          {isPaid && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                disabled={portalLoading}
                onClick={() => createPortalSession()}
              >
                {portalLoading ? 'Opening portal…' : 'Manage in Stripe'}
              </Button>

              {cancelAtPeriodEnd ? (
                <Button
                  variant="default"
                  className="flex-1"
                  disabled={resumeLoading}
                  onClick={() => resumeSubscription()}
                >
                  {resumeLoading ? 'Resuming…' : 'Resume subscription'}
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                      Cancel subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[14px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your {formatTierLabel(tier)} plan will remain active until{' '}
                        {formatDate(subscription?.currentPeriodEnd)}. After that you&apos;ll be moved to the Free
                        plan. You can resume anytime before then.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep plan</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={cancelLoading}
                        onClick={() => cancelSubscription()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {cancelLoading ? 'Cancelling…' : 'Cancel subscription'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}

          {subLoading && !subscription && <Skeleton className="h-4 w-40" />}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
        <CardHeader>
          <CardTitle className="text-[15px] flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Usage this period
          </CardTitle>
          <CardDescription className="text-[13px]">
            {usage?.resetsAt ? `Resets on ${formatDate(usage.resetsAt)}` : 'Current billing period usage'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageLoading && !usage ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : usage ? (
            <>
              <UsageMeter label="Goals" used={usage.goalsCreated} limit={usage.goalLimit} percent={usage.goalUsagePercent} />
              <UsageMeter label="Plans" used={usage.plansGenerated} limit={usage.planLimit} percent={usage.planUsagePercent} />
              <UsageMeter label="Tasks" used={usage.tasksCreated} limit={usage.taskLimit} percent={usage.taskUsagePercent} />
              <UsageMeter
                label="AI generations"
                used={usage.aiGenerationsUsed}
                limit={usage.aiGenerationLimit}
                percent={usage.aiUsagePercent}
              />
            </>
          ) : (
            <p className="text-[13px] text-muted-foreground">Usage data is not available right now.</p>
          )}
        </CardContent>
      </Card>

      {/* Payment method & invoices */}
      {isPaid && (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment & invoices
            </CardTitle>
            <CardDescription className="text-[13px]">Payment method and billing history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingLoading && !billingInfo ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-[13px]">
                    <div className="text-muted-foreground">Payment method</div>
                    {paymentMethod ? (
                      <div className="mt-0.5 font-medium capitalize">
                        {paymentMethod.brand} •••• {paymentMethod.last4}
                        <span className="ml-2 text-muted-foreground">
                          Exp {String(paymentMethod.expMonth).padStart(2, '0')}/{paymentMethod.expYear}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-0.5 text-muted-foreground">No card on file</div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" disabled={portalLoading} onClick={() => createPortalSession()}>
                    Update <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-[13px] font-medium">Invoice history</div>
                  {invoices.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">No invoices yet.</p>
                  ) : (
                    <ul className="divide-y divide-border rounded-[10px] border">
                      {invoices.map((invoice: any) => (
                        <li key={invoice.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
                          <div className="min-w-0">
                            <div className="font-medium">{formatDate(invoice.created)}</div>
                            <div className="text-muted-foreground capitalize">{invoice.status}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{formatMoney(invoice.amountPaid || invoice.amountDue, invoice.currency)}</span>
                            {invoice.invoicePdf && (
                              <a
                                href={invoice.invoicePdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
