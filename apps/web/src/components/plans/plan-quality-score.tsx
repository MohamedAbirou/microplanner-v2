'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QualityMetric {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  issues?: string[];
  suggestions?: string[];
}

interface PlanQualityScoreProps {
  metrics: QualityMetric[];
  overallScore: number;
  className?: string;
}

export function PlanQualityScore({ metrics, overallScore, className }: PlanQualityScoreProps) {
  const scorePercentage = (overallScore / 100) * 100;

  // Determine quality level
  const getQualityLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', variant: 'default' as const };
    if (score >= 75) return { label: 'Good', color: 'text-blue-600', variant: 'default' as const };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', variant: 'secondary' as const };
    return { label: 'Needs Improvement', color: 'text-red-600', variant: 'destructive' as const };
  };

  const qualityLevel = getQualityLevel(overallScore);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plan Quality Score</CardTitle>
            <CardDescription>
              AI-analyzed optimization metrics for your weekly plan
            </CardDescription>
          </div>
          <div className="text-center">
            <div className={cn('text-4xl font-bold', qualityLevel.color)}>
              {overallScore}
            </div>
            <Badge variant={qualityLevel.variant} className="mt-1">
              {qualityLevel.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Quality</span>
            <span className="text-sm text-muted-foreground">{overallScore}/100</span>
          </div>
          <Progress value={scorePercentage} className="h-2" />
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const metricPercentage = (metric.score / metric.maxScore) * 100;
            const hasIssues = metric.issues && metric.issues.length > 0;
            const hasSuggestions = metric.suggestions && metric.suggestions.length > 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{metric.name}</span>
                      {metricPercentage === 100 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {hasIssues && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {metric.description}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground ml-4">
                    {metric.score}/{metric.maxScore}
                  </span>
                </div>

                <Progress value={metricPercentage} className="h-1.5" />

                {/* Issues */}
                {hasIssues && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                          Issues Found:
                        </p>
                        <ul className="text-xs text-yellow-600 dark:text-yellow-500 space-y-0.5">
                          {metric.issues?.map((issue, i) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {hasSuggestions && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                          Suggestions:
                        </p>
                        <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-0.5">
                          {metric.suggestions?.map((suggestion, i) => (
                            <li key={i}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Message */}
        {overallScore >= 90 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Excellent Plan!
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  Your plan is well-optimized and balanced. Ready to accept and start your week!
                </p>
              </div>
            </div>
          </div>
        )}

        {overallScore < 75 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Consider Regenerating
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  This plan could be improved. Try adjusting your preferences or regenerate with different settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
