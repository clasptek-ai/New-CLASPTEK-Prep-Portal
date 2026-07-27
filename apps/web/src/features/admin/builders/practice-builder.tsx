'use client';

import React, { useState } from 'react';
import {
  Page,
  Container,
  Card,
  Button,
  Stack,
  Inline,
  Input,
  Select,
} from '@clasptek/design-system';

export function PracticeBuilder() {
  const [exam, setExam] = useState('IELTS');
  const [skill, setSkill] = useState('READING');
  const [orderMode, setOrderMode] = useState('RANDOM');
  const [feedbackMode, setFeedbackMode] = useState('IMMEDIATE');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Practice Builder</h1>
              <p className="text-xs text-slate-400">
                Configure practice sets, feedback modes, and question pools
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={handleSave}>
              Publish Practice Set
            </Button>
          </Inline>

          {saved && (
            <div className="rounded-lg bg-emerald-900/40 border border-emerald-700 px-4 py-3 text-sm text-emerald-300">
              ✓ Practice assessment set created and published!
            </div>
          )}

          <Card variant="bordered">
            <Stack gap="md">
              <Select
                id="select-exam"
                label="Target Exam"
                value={exam}
                onChange={(e: any) => setExam(e.target.value)}
              >
                <option value="IELTS">IELTS Academic</option>
                <option value="TOEFL">TOEFL iBT</option>
                <option value="CELPIP">CELPIP General</option>
                <option value="SAT">SAT Digital</option>
              </Select>

              <Select
                id="select-skill"
                label="Skill Module"
                value={skill}
                onChange={(e: any) => setSkill(e.target.value)}
              >
                <option value="READING">Reading</option>
                <option value="LISTENING">Listening</option>
                <option value="WRITING">Writing</option>
                <option value="SPEAKING">Speaking</option>
              </Select>

              <Select
                id="select-feedback"
                label="Feedback Delivery"
                value={feedbackMode}
                onChange={(e: any) => setFeedbackMode(e.target.value)}
              >
                <option value="IMMEDIATE">Immediate Feedback & Explanations</option>
                <option value="DELAYED">Delayed (End of Practice Session)</option>
                <option value="SUMMARY_ONLY">Summary Score Only</option>
              </Select>

              <Select
                id="select-order"
                label="Question Ordering"
                value={orderMode}
                onChange={(e: any) => setOrderMode(e.target.value)}
              >
                <option value="RANDOM">Randomized Order</option>
                <option value="FIXED">Fixed Sequence</option>
              </Select>

              <Input id="time-limit" label="Time Limit (Minutes)" type="number" defaultValue="30" />
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
