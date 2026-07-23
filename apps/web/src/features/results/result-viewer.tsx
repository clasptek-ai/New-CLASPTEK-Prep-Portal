'use client';

import React from 'react';
import { Card, Stack, Inline, Badge } from '@clasptek/design-system';

export type VisibilityMode = 'SCORE_ONLY' | 'SCORE_SECTIONS' | 'SCORE_CORRECT' | 'FULL_REVIEW';

interface ResultViewerProps {
  overallScore: number;
  maxScore: number;
  isPassed: boolean;
  visibilityMode?: VisibilityMode;
}

export function ResultViewer({
  overallScore = 82.5,
  maxScore = 100,
  isPassed = true,
  visibilityMode = 'FULL_REVIEW',
}: ResultViewerProps) {
  return (
    <Card variant="bordered">
      <Stack gap="md">
        <Inline className="justify-between">
          <h3 className="text-base font-bold text-slate-100">Assessment Result</h3>
          <Badge variant={isPassed ? 'success' : 'danger'}>
            {isPassed ? 'PASSED' : 'NEEDS REVISION'}
          </Badge>
        </Inline>

        <div className="text-3xl font-bold text-slate-100">
          {overallScore} / {maxScore}
        </div>

        {['SCORE_SECTIONS', 'SCORE_CORRECT', 'FULL_REVIEW'].includes(visibilityMode) && (
          <div className="rounded bg-slate-800 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Listening Section:</span>
              <span className="font-semibold text-slate-200">80%</span>
            </div>
            <div className="flex justify-between">
              <span>Reading Section:</span>
              <span className="font-semibold text-slate-200">85%</span>
            </div>
          </div>
        )}
      </Stack>
    </Card>
  );
}
