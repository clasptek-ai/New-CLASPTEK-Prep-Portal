'use client';

import React, { useState } from 'react';
import { Card, Button, Stack, Inline, Badge } from '@clasptek/design-system';

export function PracticePlayer() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <Card variant="bordered">
      <Stack gap="md">
        <Inline className="justify-between">
          <Badge variant="info">Grammar Practice Set</Badge>
          <Button
            size="sm"
            variant={isBookmarked ? 'primary' : 'outline'}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            {isBookmarked ? 'Bookmarked ★' : 'Bookmark ☆'}
          </Button>
        </Inline>

        <div className="text-sm font-semibold text-slate-100 mt-2">
          Question 1: Choose the grammatically correct sentence completion.
        </div>

        <Stack gap="sm" className="mt-2">
          {[
            'The committee has reached its decision.',
            'The committee have reached its decision.',
          ].map((opt, idx) => (
            <button
              key={idx}
              className={`p-3 rounded border text-left text-xs transition-colors ${
                selectedOption === opt
                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              onClick={() => setSelectedOption(opt)}
            >
              {opt}
            </button>
          ))}
        </Stack>

        <Inline className="justify-between mt-4">
          <Button size="sm" variant="outline">
            Previous
          </Button>
          <Button size="sm" variant="primary">
            Submit Answer
          </Button>
        </Inline>
      </Stack>
    </Card>
  );
}
