'use client';

import React from 'react';
import { Page, Container, Card, Button, Stack, Inline, Badge, Grid } from '@clasptek/design-system';

export function AttemptReviewConsole() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Student Attempt Review Console</h1>
              <p className="text-xs text-slate-400">
                Detailed item response analysis & distractor calibration
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = '/admin/question-bank')}
            >
              ← Question Bank
            </Button>
          </Inline>

          <Grid cols={3} gap="md">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Total Attempted
              </span>
              <div className="text-3xl font-bold text-slate-100 mt-1">1,480</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Accuracy Rate</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">64.2%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Facility Index</span>
              <div className="text-3xl font-bold text-indigo-400 mt-1">0.64</div>
            </Card>
          </Grid>

          <Card variant="bordered">
            <h3 className="text-base font-semibold text-slate-100 mb-3">
              Distractor Analysis — Q104
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-emerald-950/40 border border-emerald-800">
                <span className="text-emerald-300 font-semibold">
                  Option A (Correct): Accelerated coastal erosion
                </span>
                <Badge variant="success">64.2% (950 votes)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-slate-300">
                  Option B (Distractor): Increased storm surge frequency
                </span>
                <Badge variant="warning">21.4% (316 votes)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-slate-300">Option C (Distractor): Land subsidence rates</span>
                <Badge variant="neutral">9.8% (145 votes)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-slate-300">
                  Option D (Distractor): Municipal policy mandates
                </span>
                <Badge variant="neutral">4.6% (69 votes)</Badge>
              </div>
            </div>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
