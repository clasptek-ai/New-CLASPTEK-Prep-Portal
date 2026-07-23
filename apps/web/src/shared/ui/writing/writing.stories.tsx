import React from 'react';
import { WordCounter } from './WordCounter';

export default {
  title: 'Assessment/WordCounter',
  component: WordCounter,
};

export const Default = () => <WordCounter text="Sample IELTS Task 2 essay text." minTarget={250} />;
