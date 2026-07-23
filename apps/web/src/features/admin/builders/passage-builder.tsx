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
  Textarea,
  Badge,
} from '@clasptek/design-system';

export function PassageBuilder() {
  const [passageType, setPassageType] = useState('READING');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = () => {
    if (!title || !content) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Passage Builder</h1>
              <p className="text-xs text-slate-400">
                Author Reading Passages, Listening Scripts, Cue Cards & Prompts
              </p>
            </div>
            <Inline gap="sm">
              <Badge variant="info">{passageType}</Badge>
              <Button size="sm" variant="primary" onClick={handleSave}>
                Save Passage
              </Button>
            </Inline>
          </Inline>

          {saved && (
            <div className="rounded-lg bg-emerald-900/40 border border-emerald-700 px-4 py-3 text-sm text-emerald-300">
              ✓ Passage saved successfully! Word count: {wordCount}
            </div>
          )}

          <Card variant="bordered">
            <Stack gap="md">
              <Select
                id="passage-type"
                label="Passage Type"
                value={passageType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPassageType(e.target.value)
                }
              >
                <option value="READING">Reading Passage</option>
                <option value="LISTENING_SCRIPT">Listening Script</option>
                <option value="SPEAKING_CUE_CARD">Speaking Cue Card</option>
                <option value="WRITING_PROMPT">Writing Prompt</option>
                <option value="SHARED_RESOURCE">Shared Resource</option>
              </Select>

              <Input
                id="passage-title"
                label="Passage Title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g. The History of Artificial Intelligence"
              />

              <div>
                <Inline className="justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">Passage Content</label>
                  <span className="text-xs text-slate-500">{wordCount} words</span>
                </Inline>
                <Textarea
                  id="passage-content"
                  label=""
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  placeholder="Paste or write passage text here..."
                  rows={12}
                />
              </div>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
