'use client';

import React, { useState } from 'react';
import {
  Page,
  Container,
  Card,
  Button,
  Stack,
  Inline,
  Select,
  Grid,
} from '@clasptek/design-system';

export function AssessmentBuilder() {
  const [blueprint, setBlueprint] = useState('ielts-diag-v1');
  const [allocated, setAllocated] = useState(false);

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Assessment Builder</h1>
              <p className="text-xs text-slate-400">
                Blueprint-driven auto allocation & validation
              </p>
            </div>
            <Inline gap="sm">
              <Button size="sm" variant="outline" onClick={() => setAllocated(true)}>
                Auto Allocate Questions
              </Button>
              <Button size="sm" variant="primary" disabled={!allocated}>
                Publish Assessment
              </Button>
            </Inline>
          </Inline>

          <Card variant="bordered">
            <Stack gap="md">
              <Select
                id="select-bp"
                label="Select Assessment Blueprint"
                value={blueprint}
                onChange={(e: any) => setBlueprint(e.target.value)}
              >
                <option value="ielts-diag-v1">
                  IELTS Academic Diagnostic Blueprint (80 Items)
                </option>
                <option value="toefl-diag-v1">TOEFL iBT Diagnostic Blueprint (70 Items)</option>
                <option value="sat-diag-v1">SAT Digital Mathematics Blueprint (54 Items)</option>
              </Select>

              {allocated ? (
                <div className="rounded-lg bg-indigo-900/40 border border-indigo-700 p-4">
                  <h4 className="text-sm font-bold text-indigo-300 mb-2">
                    Question Allocation Complete
                  </h4>
                  <Grid cols={4} gap="sm">
                    <div>
                      <span className="text-xs text-slate-400">Listening</span>
                      <p className="text-lg font-bold text-slate-100">40 / 40 items</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Reading</span>
                      <p className="text-lg font-bold text-slate-100">40 / 40 items</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Writing</span>
                      <p className="text-lg font-bold text-slate-100">2 / 2 tasks</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Health Score</span>
                      <p className="text-lg font-bold text-emerald-400">96.5 / 100</p>
                    </div>
                  </Grid>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Select a blueprint and click 'Auto Allocate Questions' to assemble the assessment.
                </p>
              )}
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
