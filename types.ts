
import React from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactElement;
  component: React.ComponentType;
  category: string;
}

export interface ToolCategory {
  name: string;
  tools: Tool[];
}

export interface ColorInfo {
  hex: string;
  name: string;
}

export interface ColorPalette {
  palette: ColorInfo[];
}

export interface ResearchSummary {
    researchQuestion: string;
    methodology: string;
    keyFindings: string;
}

export interface DebugResult {
    explanation: string;
    fixedCode: string;
}

export interface EmojiRiddle {
    riddle: string;
    answer: string;
}

export interface StorySegment {
    author: 'Storyteller' | 'You';
    text: string;
}

export interface MathSolution {
    solution: string;
    steps: string[];
}

export interface HistoryStory {
    title: string;
    narrative: string;
}

export interface FoundSource {
    url: string;
    title: string;
}

export interface PlagiarismResult {
    summary: string;
    sources: FoundSource[];
}
