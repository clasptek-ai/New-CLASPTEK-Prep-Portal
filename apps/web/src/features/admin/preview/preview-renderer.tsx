'use client';

import React, { useState } from 'react';
import { Page, Container, Card, Button, Stack, Inline, Badge } from '@clasptek/design-system';

export type PreviewMode = 'DESKTOP' | 'TABLET' | 'EXAM_MODE';

interface PreviewRendererProps {
  initialMode?: PreviewMode;
  resourceTitle?: string;
  questionPrompt?: string;
}

export function PreviewRenderer({
  initialMode = 'DESKTOP',
  resourceTitle = 'IELTS Reading Passage 1 — Climate Adaptation',
  questionPrompt = 'According to paragraph 2, what primary factor led to the construction of coastal sea walls?',
}: PreviewRendererProps) {
  const [mode, setMode] = useState<PreviewMode>(initialMode);

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Universal Preview Engine</h1>
              <p className="text-xs text-slate-400">
                Single rendering pipeline with multi-device modes
              </p>
            </div>
            <Inline gap="xs">
              <Button
                size="sm"
                variant={mode === 'DESKTOP' ? 'primary' : 'outline'}
                onClick={() => setMode('DESKTOP')}
              >
                Desktop
              </Button>
              <Button
                size="sm"
                variant={mode === 'TABLET' ? 'primary' : 'outline'}
                onClick={() => setMode('TABLET')}
              >
                Tablet
              </Button>
              <Button
                size="sm"
                variant={mode === 'EXAM_MODE' ? 'primary' : 'outline'}
                onClick={() => setMode('EXAM_MODE')}
              >
                Exam Mode
              </Button>
            </Inline>
          </Inline>

          <div
            className={`transition-all duration-300 mx-auto border border-slate-700 rounded-lg p-6 bg-slate-900 ${
              mode === 'TABLET'
                ? 'max-w-md shadow-2xl'
                : mode === 'EXAM_MODE'
                  ? 'w-full bg-black border-amber-600/50'
                  : 'w-full'
            }`}
          >
            <Stack gap="md">
              <Inline className="justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase">{resourceTitle}</span>
                <Badge variant={mode === 'EXAM_MODE' ? 'warning' : 'info'}>{mode}</Badge>
              </Inline>

              <div className="text-slate-200 text-sm leading-relaxed">
                <p className="mb-4">
                  Rising sea levels over the past three decades have forced coastal urban centers to
                  rethink infrastructure defenses. Engineers in the Netherlands implemented dynamic
                  barrier systems...
                </p>
                <div className="p-4 rounded bg-slate-800/80 border border-slate-700">
                  <p className="font-semibold text-slate-100 mb-2">Q1. {questionPrompt}</p>
                  <Stack gap="xs">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input type="radio" name="preview-q1" /> A) Accelerated coastal erosion
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input type="radio" name="preview-q1" /> B) Increased storm surge frequency
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input type="radio" name="preview-q1" /> C) Land subsidence rates
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input type="radio" name="preview-q1" /> D) Municipal policy mandates
                    </label>
                  </Stack>
                </div>
              </div>
            </Stack>
          </div>
        </Stack>
      </Container>
    </Page>
  );
}
