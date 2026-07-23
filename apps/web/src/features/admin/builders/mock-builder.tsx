'use client';

import React, { useState } from 'react';
import { Page, Container, Card, Button, Stack, Inline, Badge, Grid } from '@clasptek/design-system';

export function MockBuilder() {
  const [locked, setLocked] = useState(false);

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Mock Exam Builder</h1>
              <p className="text-xs text-slate-400">
                Assemble official-spec mock exams with admin locking
              </p>
            </div>
            <Inline gap="sm">
              {locked ? (
                <Button size="sm" variant="warning" onClick={() => setLocked(false)}>
                  Admin Unlock
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={() => setLocked(true)}>
                  Lock & Publish Mock Exam
                </Button>
              )}
            </Inline>
          </Inline>

          <Card variant="bordered">
            <Stack gap="md">
              <Inline className="justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Official IELTS Academic Mock #4
                  </h3>
                  <p className="text-xs text-slate-400">Total Duration: 180 Minutes · 4 Sections</p>
                </div>
                <Badge variant={locked ? 'danger' : 'success'}>
                  {locked ? 'LOCKED (Official Mode)' : 'EDITABLE'}
                </Badge>
              </Inline>

              <Grid cols={4} gap="md">
                <Card variant="bordered">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Listening</span>
                  <div className="text-xl font-bold text-slate-100 mt-1">40 Questions</div>
                  <span className="text-xs text-slate-500 block mt-1">30 Minutes</span>
                </Card>
                <Card variant="bordered">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Reading</span>
                  <div className="text-xl font-bold text-slate-100 mt-1">40 Questions</div>
                  <span className="text-xs text-slate-500 block mt-1">60 Minutes</span>
                </Card>
                <Card variant="bordered">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Writing</span>
                  <div className="text-xl font-bold text-slate-100 mt-1">2 Tasks</div>
                  <span className="text-xs text-slate-500 block mt-1">60 Minutes</span>
                </Card>
                <Card variant="bordered">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Speaking</span>
                  <div className="text-xl font-bold text-slate-100 mt-1">3 Parts</div>
                  <span className="text-xs text-slate-500 block mt-1">15 Minutes</span>
                </Card>
              </Grid>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
