'use client';

import * as React from 'react';
import {
  Activity,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  KeyRound,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'https://microplanner-v2-api.onrender.com').replace(/\/$/, '');
const API_BASE = API_ORIGIN.endsWith('/api') ? `${API_ORIGIN}/v1` : `${API_ORIGIN}/api/v1`;

const scopes = [
  ['tasks:read', 'Read tasks, details, and reschedule suggestions'],
  ['tasks:write', 'Create, update, complete, skip, delete, and bulk-update tasks'],
  ['goals:read', 'Read goals and goal lists'],
  ['goals:write', 'Create, update, pause, activate, and delete goals'],
  ['plans:read', 'Read plans, history, and templates'],
  ['plans:write', 'Generate, create, update, accept, regenerate, and archive plans'],
  ['analytics:read', 'Read metrics, insights, usage, patterns, and goal analytics'],
  ['webhooks:manage', 'Create, inspect, test, toggle, retry, update, and delete webhooks'],
] as const;

const endpoints = [
  { method: 'GET', path: '/tasks?limit=50', scope: 'tasks:read', description: 'List tasks with optional date, goal, project, status, and pagination filters.' },
  { method: 'POST', path: '/tasks', scope: 'tasks:write', description: 'Create a task with title, schedule, duration, and optional goal/project.' },
  { method: 'GET', path: '/tasks/:id', scope: 'tasks:read', description: 'Retrieve one task by ID.' },
  { method: 'PUT', path: '/tasks/:id', scope: 'tasks:write', description: 'Update task details or schedule.' },
  { method: 'POST', path: '/tasks/:id/complete', scope: 'tasks:write', description: 'Mark a task complete.' },
  { method: 'GET', path: '/goals', scope: 'goals:read', description: 'List goals with pagination and active-state filters.' },
  { method: 'POST', path: '/goals', scope: 'goals:write', description: 'Create a goal.' },
  { method: 'GET', path: '/plans/current', scope: 'plans:read', description: 'Retrieve the current week plan.' },
  { method: 'GET', path: '/plans', scope: 'plans:read', description: 'List plan history.' },
  { method: 'POST', path: '/plans/generate', scope: 'plans:write', description: 'Generate an AI weekly plan.' },
  { method: 'GET', path: '/analytics/metrics', scope: 'analytics:read', description: 'Retrieve dashboard productivity metrics.' },
  { method: 'GET', path: '/analytics/insights', scope: 'analytics:read', description: 'Retrieve weekly insights.' },
  { method: 'GET', path: '/integrations/webhooks', scope: 'webhooks:manage', description: 'List configured webhooks.' },
  { method: 'POST', path: '/integrations/webhooks', scope: 'webhooks:manage', description: 'Create a webhook subscription.' },
] as const;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-slate-800 bg-slate-950">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-white"
        onClick={copy}
        title="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="overflow-x-auto p-4 pr-12 text-[12px] leading-6 text-slate-200"><code>{code}</code></pre>
    </div>
  );
}

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = React.useState('');
  const [selectedPath, setSelectedPath] = React.useState('/tasks?limit=1');
  const [testState, setTestState] = React.useState<{ status: number; body: string } | null>(null);
  const [testing, setTesting] = React.useState(false);

  const runTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestState(null);
    try {
      const response = await fetch(`${API_BASE}${selectedPath}`, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      const text = await response.text();
      let body = text;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // Keep non-JSON error responses readable.
      }
      setTestState({ status: response.status, body });
    } catch (error) {
      setTestState({ status: 0, body: error instanceof Error ? error.message : 'Request failed' });
    } finally {
      setTesting(false);
    }
  };

  const curlExample = `curl -X GET "${API_BASE}/tasks?limit=50" \\\n+  -H "Authorization: Bearer mp_your_api_key" \\\n+  -H "Accept: application/json"`;
  const jsExample = `const response = await fetch('${API_BASE}/tasks?limit=50', {
  headers: {
    Authorization: 'Bearer ' + process.env.MICROPLANNER_API_KEY,
    Accept: 'application/json',
  },
});

const data = await response.json();`;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-5 pb-16 md:p-8 mp-fade-in">
      <section className="relative overflow-hidden rounded-[18px] border border-slate-800 bg-slate-950 px-6 py-8 text-white shadow-[var(--sh-md)] md:px-10">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(120deg,transparent,rgba(16,185,129,.12))]" />
        <div className="relative max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-emerald-300"><Code2 className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Developer workspace</span></div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">MicroPlanner API</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Connect your CMS, automation, or internal tools to tasks, goals, plans, analytics, and webhooks through a scoped REST API.</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200">v1</Badge>
            <code className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-slate-200">{API_BASE}</code>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4 text-emerald-600" />Authentication</CardTitle><CardDescription>Use a Premium API key in every REST request.</CardDescription></CardHeader>
          <CardContent className="space-y-4"><CodeBlock code={'Authorization: Bearer mp_your_api_key'} /><div className="flex gap-3 rounded-[10px] border border-amber-300 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"><ShieldCheck className="mt-0.5 h-4 w-4 flex-none" /><span>Keep keys on your CMS server or backend environment. Never commit them, expose them in browser code, or send them to third-party services.</span></div></CardContent>
        </Card>
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-emerald-600" />Response contract</CardTitle><CardDescription>JSON responses use normal HTTP status codes.</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p><strong className="text-foreground">200/201</strong> request succeeded</p><p><strong className="text-foreground">400</strong> invalid request</p><p><strong className="text-foreground">401</strong> invalid, expired, or revoked API key</p><p><strong className="text-foreground">403</strong> missing scope or Premium access</p><p><strong className="text-foreground">429</strong> key rate limit exceeded</p></CardContent></Card>
      </div>

      <section className="space-y-4"><div><h2 className="text-xl font-semibold">Quick start</h2><p className="mt-1 text-sm text-muted-foreground">The same request works from any server-side CMS, worker, or integration service.</p></div><div className="grid gap-4 lg:grid-cols-2"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><TerminalIcon /> cURL</div><CodeBlock code={curlExample} /></div><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Code2 className="h-3.5 w-3.5" /> JavaScript</div><CodeBlock code={jsExample} /></div></div></section>

      <section className="space-y-4"><div><h2 className="text-xl font-semibold">Scopes</h2><p className="mt-1 text-sm text-muted-foreground">Choose the minimum permissions your integration needs when creating a key.</p></div><div className="grid gap-2 md:grid-cols-2">{scopes.map(([name, description]) => <div key={name} className="flex items-start gap-3 rounded-[10px] border border-border bg-card p-3"><Badge variant="secondary" className="mt-0.5 font-mono text-[10px]">{name}</Badge><span className="text-sm text-muted-foreground">{description}</span></div>)}</div></section>

      <section className="space-y-4"><div><h2 className="text-xl font-semibold">Live API test</h2><p className="mt-1 text-sm text-muted-foreground">Run a safe read request against the configured REST service. Your key is used only in memory for this request.</p></div><Card className="rounded-[14px] shadow-[var(--sh-sm)]"><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_240px_auto] md:items-end"><div className="space-y-2"><Label htmlFor="api-key-test">API key</Label><Input id="api-key-test" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="mp_..." autoComplete="off" /></div><div className="space-y-2"><Label htmlFor="api-test-route">Read endpoint</Label><select id="api-test-route" value={selectedPath} onChange={e => setSelectedPath(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="/tasks?limit=1">GET /tasks</option><option value="/goals?limit=1">GET /goals</option><option value="/plans?limit=1">GET /plans</option><option value="/analytics/metrics">GET /analytics/metrics</option></select></div><Button onClick={runTest} disabled={!apiKey.trim() || testing} className="h-10"><Play className="mr-2 h-4 w-4" />{testing ? 'Testing...' : 'Send request'}</Button></CardContent>{testState && <><Separator /><div className="space-y-2 p-5"><div className="flex items-center gap-2 text-sm font-medium"><span className={cn('h-2.5 w-2.5 rounded-full', testState.status >= 200 && testState.status < 300 ? 'bg-emerald-500' : 'bg-red-500')} />HTTP {testState.status || 'Network error'}</div><pre className="max-h-72 overflow-auto rounded-[10px] bg-slate-950 p-4 text-xs leading-5 text-slate-200">{testState.body}</pre></div></>}</Card></section>

      <section className="space-y-4"><div><h2 className="text-xl font-semibold">Endpoint reference</h2><p className="mt-1 text-sm text-muted-foreground">All URLs are relative to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{API_BASE}</code>.</p></div><div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[var(--sh-sm)]"><div className="divide-y divide-border">{endpoints.map(endpoint => <div key={`${endpoint.method}-${endpoint.path}`} className="grid gap-2 p-4 md:grid-cols-[72px_minmax(220px,300px)_130px_1fr] md:items-center"><Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="w-fit font-mono text-[10px]">{endpoint.method}</Badge><code className="text-xs text-foreground">{endpoint.path}</code><Badge variant="outline" className="w-fit font-mono text-[10px]">{endpoint.scope}</Badge><span className="text-sm text-muted-foreground">{endpoint.description}</span></div>)}</div></div></section>

      <section className="rounded-[14px] border border-border bg-accent p-5"><div className="flex items-start gap-3"><BookOpen className="mt-0.5 h-5 w-5 flex-none text-emerald-600" /><div><h2 className="font-semibold">Create and manage keys</h2><p className="mt-1 text-sm text-muted-foreground">Open Settings → API Keys to create a Premium key, select scopes, copy the secret once, disable it, or revoke it. Revoked keys disappear from the active list and immediately stop authenticating.</p><Button variant="link" className="mt-2 h-auto p-0 text-emerald-700" onClick={() => window.location.assign('/settings?tab=api')}>Open API key settings <ChevronRight className="ml-1 h-4 w-4" /></Button></div></div></section>
    </main>
  );
}

function TerminalIcon() {
  return <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-current text-[8px]">$</span>;
}