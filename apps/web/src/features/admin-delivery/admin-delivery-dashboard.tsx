'use client';

import React from 'react';
import { Page, Container, Card, Button, Stack, Inline, Grid } from '@clasptek/design-system';

export function AdminDeliveryDashboard() {
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Assessment Delivery Console</h1>
              <p className="text-xs text-slate-400">
                Live examination sessions, timer drift & integrity monitoring
              </p>
            </div>
            <Button size="sm" variant="outline">
              Refresh Telemetry
            </Button>
          </Inline>

          <Grid cols={4} gap="md">
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Live Sessions</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">14</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Timed Out</span>
              <div className="text-3xl font-bold text-amber-400 mt-1">3</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Abandoned</span>
              <div className="text-3xl font-bold text-red-400 mt-1">2</div>
            </Card>
            <Card variant="bordered">
              <span className="text-xs text-slate-400 font-semibold uppercase">Pass Rate</span>
              <div className="text-3xl font-bold text-blue-400 mt-1">78.4%</div>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Page>
  );
}
