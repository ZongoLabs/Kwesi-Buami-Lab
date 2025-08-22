
import React, { useState, useCallback } from 'react';
import { Card, Button, Alert } from '../components/common';
import { AcademicCapIcon } from '../components/Icons';
import { summarizeResearchPaper } from '../services/geminiService';
import { type ResearchSummary } from '../types';

const SummarySection = ({ title, content }: { title: string, content: string }) => (
    <div className="space-y-1">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{title}</h4>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{content}</p>
    </div>
);

export default function ResearchSummarizerPage() {
    const [inputText, setInputText] = useState('');
    const [summary, setSummary] = useState<ResearchSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSummarize = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to summarize.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSummary(null);
        try {
            const result = await summarizeResearchPaper(inputText);
            setSummary(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Research Summarizer" icon={<AcademicCapIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste the abstract or body of a research paper to extract its core components.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Academic Text
                        </label>
                        <textarea
                            id="text-input"
                            rows={12}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Paste your research text here..."
                            disabled={isLoading}
                        />
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleSummarize} isLoading={isLoading} disabled={!inputText.trim()}>
                            Summarize Research
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || summary) && (
                 <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Structured Summary</h3>
                    </div>
                     <div className="space-y-6">
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                        ) : summary && (
                            <>
                                <SummarySection title="Research Question" content={summary.researchQuestion} />
                                <SummarySection title="Methodology" content={summary.methodology} />
                                <SummarySection title="Key Findings" content={summary.keyFindings} />
                            </>
                        )}
                    </div>
                 </Card>
            )}
        </div>
    );
}