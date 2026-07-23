'use client';

import React from 'react';
import { Page, Container, Card, Button, Stack, Inline, Grid, Badge } from '@clasptek/design-system';

export function StudentPracticeDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Practice Delivery Center</h1>
              <p className="text-xs text-slate-400">
                Targeted practice sets, wrong answer queues & mastery tracking
              </p>
            </div>
            <Badge variant="info">Current Streak: 5 Days 🔥</Badge>
          </Inline>

          <Grid cols={3} gap="md">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Completion Rate
              </span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">84.0%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Mastery Level</span>
              <div className="text-3xl font-bold text-blue-400 mt-1">92.5%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Wrong Answer Queue
              </span>
              <div className="text-3xl font-bold text-amber-400 mt-1">4 Items</div>
            </Card>
          </Grid>

          <Card variant="bordered">
            <Stack gap="md">
              <Inline className="justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Recommended Practice: Grammar Accuracy
                  </h3>
                  <p className="text-xs text-slate-400">
                    Targeted rule reinforcement for Subject-Verb Agreement
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => (window.location.href = '/practice/player')}
                >
                  Start Recommended Practice
                </Button>
              </Inline>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
