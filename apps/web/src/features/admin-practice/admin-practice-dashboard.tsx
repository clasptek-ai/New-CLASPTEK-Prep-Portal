'use client';

import React from 'react';
import { Page, Container, Card, Button, Stack, Inline, Grid, Badge } from '@clasptek/design-system';

export function AdminPracticeDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Practice Management Console</h1>
              <p className="text-xs text-slate-400">
                Unlock practice sets, monitor student mastery & mock examination readiness
              </p>
            </div>
            <Button size="sm" variant="primary">
              Bulk Unlock All
            </Button>
          </Inline>

          <Grid cols={4} gap="md">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Sessions</span>
              <div className="text-3xl font-bold text-slate-100 mt-1">3,450</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Avg Accuracy</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">79.2%</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Mock Ready Students
              </span>
              <div className="text-3xl font-bold text-blue-400 mt-1">18</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Wrong Queue Items
              </span>
              <div className="text-3xl font-bold text-amber-400 mt-1">142</div>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}
