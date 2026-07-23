'use client';

import React from 'react';
import { Page, Container, Card, Button, Stack, Inline, Grid, Badge } from '@clasptek/design-system';

export function PublishingDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Publishing Operations Dashboard</h1>
              <p className="text-xs text-slate-400">
                9-state lifecycle queue monitoring & audit tracking
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => (window.location.href = '/admin/question-bank')}
            >
              Question Bank
            </Button>
          </Inline>

          <Grid cols={4} gap="sm">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Draft</span>
              <div className="text-2xl font-bold text-slate-200 mt-1">42</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Tech Review</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">18</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Academic QA</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">12</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Queued</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1">6</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Published</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">1,240</div>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}

export function ContentCompletionDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <h1 className="text-2xl font-bold text-slate-100">Content Completion Dashboard</h1>
          <Grid cols={3} gap="md">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">IELTS Academic</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">94.2%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">TOEFL iBT</span>
              <div className="text-3xl font-bold text-indigo-400 mt-1">88.5%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">SAT Digital</span>
              <div className="text-3xl font-bold text-blue-400 mt-1">91.0%</div>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}

export function QuestionUsageDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <h1 className="text-2xl font-bold text-slate-100">Question Usage Dashboard</h1>
          <Grid cols={3} gap="md">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Serves</span>
              <div className="text-3xl font-bold text-slate-100 mt-1">142,500</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Avg Facility Index
              </span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">0.68</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Overused Items</span>
              <div className="text-3xl font-bold text-amber-400 mt-1">8</div>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}

export function AssessmentHealthDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <h1 className="text-2xl font-bold text-slate-100">Assessment Health Dashboard</h1>
          <Grid cols={4} gap="md">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Blueprint Coverage
              </span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">98.0%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Skill Coverage</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">95.5%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Difficulty Balance
              </span>
              <div className="text-3xl font-bold text-indigo-400 mt-1">92.0%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Overall Health</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">96.4</div>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}
