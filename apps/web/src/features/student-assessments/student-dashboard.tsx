'use client';

import React from 'react';
import { Page, Container, Card, Button, Stack, Inline, Grid, Badge } from '@clasptek/design-system';

export function StudentAssessmentDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Student Assessment Center</h1>
              <p className="text-xs text-slate-400">
                Available assessments, active timers & attempt history
              </p>
            </div>
            <Badge variant="info">Active Session: IELTS Diagnostic #1</Badge>
          </Inline>

          <Card variant="bordered">
            <Stack gap="md">
              <Inline className="justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    IELTS Academic Diagnostic Assessment
                  </h3>
                  <p className="text-xs text-slate-400">
                    Duration: 180 Minutes · 80 Questions · Attempt 1 of 3
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => (window.location.href = '/assessments')}
                >
                  Continue Assessment
                </Button>
              </Inline>
              <div className="rounded bg-slate-800 p-3 flex justify-between items-center text-xs">
                <span className="text-slate-300">Remaining Time: 01:29:45</span>
                <span className="text-emerald-400 font-semibold">Server Synced</span>
              </div>
            </Stack>
          </Card>

          <h3 className="text-base font-bold text-slate-100 mt-4">Recent Attempt History</h3>
          <Grid cols={2} gap="md">
            <Card variant="bordered">
              <Inline className="justify-between mb-2">
                <span className="text-sm font-semibold text-slate-200">IELTS Practice Set #3</span>
                <Badge variant="success">PASSED (85%)</Badge>
              </Inline>
              <p className="text-xs text-slate-400">Submitted 2 days ago · Duration: 28 min</p>
            </Card>
            <Card variant="bordered">
              <Inline className="justify-between mb-2">
                <span className="text-sm font-semibold text-slate-200">TOEFL iBT Reading Mock</span>
                <Badge variant="success">PASSED (78%)</Badge>
              </Inline>
              <p className="text-xs text-slate-400">Submitted 5 days ago · Duration: 54 min</p>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}
