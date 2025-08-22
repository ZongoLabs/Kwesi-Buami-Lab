import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { PencilSquareIcon, ClipboardDocumentIcon, TrashIcon } from '../components/Icons';
import { summarizeText } from '../services/geminiService';

const InfoPill = ({ label, value }: { label: string; value: number }) => (
    <span className="text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-gray-600 dark:text-gray-300">{value}</span> {label}
    </span>
);

export default function ContentSummarizerPage() {
    const [inputText, setInputText] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summaryLength, setSummaryLength] = useState<'medium' | 'short' | 'long'>('medium');

    const handleSummarize = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to summarize.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSummary('');
        try {
            const result = await summarizeText(inputText, summaryLength);
            setSummary(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, summaryLength]);
    
    const handleCopy = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        toast.success('Summary copied to clipboard!');
    };
    
    const handleClear = () => {
        setInputText('');
        setSummary('');
        setError(null);
    };

    const inputStats = useMemo(() => {
        const words = inputText.trim().split(/\s+/).filter(Boolean).length;
        const chars = inputText.length;
        return { words, chars };
    }, [inputText]);

    const summaryStats = useMemo(() => {
        const words = summary.trim().split(/\s+/).filter(Boolean).length;
        const chars = summary.length;
        return { words, chars };
    }, [summary]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Content Summarizer" icon={<PencilSquareIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste your text, choose the desired length, and a concise summary will be created for you.
                    </p>
                    
                    <div className="space-y-2">
                        <label htmlFor="summary-length" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summary Length</label>
                        <div className="flex space-x-2">
                            {(['short', 'medium', 'long'] as const).map(len => (
                                <button key={len} onClick={() => setSummaryLength(len)} className={`px-3 py-1 text-sm rounded-full capitalize ${summaryLength === len ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                    {len}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Your Text
                            </label>
                            <div className="flex space-x-3">
                                <InfoPill label="Words" value={inputStats.words} />
                                <InfoPill label="Chars" value={inputStats.chars} />
                            </div>
                        </div>
                        <textarea
                            id="text-input"
                            rows={10}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Paste a long article, report, or any text here..."
                            disabled={isLoading}
                        />
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-between items-center">
                         <Button onClick={handleClear} disabled={isLoading} className="bg-gray-500 hover:bg-gray-600">
                            <TrashIcon className="w-4 h-4 mr-2" /> Clear
                        </Button>
                        <Button onClick={handleSummarize} isLoading={isLoading} disabled={!inputText.trim()}>
                            Summarize Text
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || summary) && (
                 <Card>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Generated Summary</h3>
                         <div className="flex space-x-3">
                            <InfoPill label="Words" value={summaryStats.words} />
                            <InfoPill label="Chars" value={summaryStats.chars} />
                        </div>
                    </div>
                    {isLoading && (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    )}
                    {summary && (
                        <div className="relative">
                            <textarea
                                readOnly={isLoading}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={10}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                            />
                             <Button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                                <ClipboardDocumentIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                 </Card>
            )}
        </div>
    );
}