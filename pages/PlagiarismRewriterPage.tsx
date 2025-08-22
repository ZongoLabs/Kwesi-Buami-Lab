

import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { DocumentDuplicateIcon, ClipboardDocumentIcon, TrashIcon } from '../components/Icons';
import { rewriteForPlagiarism } from '../services/geminiService';

export default function PlagiarismRewriterPage() {
    const [inputText, setInputText] = useState('');
    const [rewrittenText, setRewrittenText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [strictness, setStrictness] = useState(0.8); // Maps to temperature

    const handleRewrite = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to rewrite.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setRewrittenText('');
        try {
            const result = await rewriteForPlagiarism(inputText, strictness);
            setRewrittenText(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, strictness]);

    const handleCopy = () => {
        if (!rewrittenText) return;
        navigator.clipboard.writeText(rewrittenText);
        toast.success('Rewritten text copied to clipboard!');
    };

    const handleClear = () => {
        setInputText('');
        setRewrittenText('');
        setError(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Card title="Originality Rewriter" icon={<DocumentDuplicateIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste your text to have it rewritten with improved originality while preserving the core meaning.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Original Text</label>
                            <textarea
                                id="text-input"
                                rows={15}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                placeholder="Paste the text you want to rewrite here..."
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="text-output" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rewritten Text</label>
                            <div className="relative">
                                <textarea
                                    id="text-output"
                                    rows={15}
                                    value={rewrittenText}
                                    readOnly
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                    placeholder={isLoading ? "Rewriting in progress..." : "The unique version of your text will appear here..."}
                                />
                                {rewrittenText && (
                                    <button onClick={handleCopy} className="absolute top-2 right-2 text-gray-500 bg-white/50 dark:bg-gray-900/50 hover:text-primary-600 dark:hover:text-primary-400 p-1 rounded-md text-xs">
                                        <ClipboardDocumentIcon className="w-5 h-5" />
                                    </button>
                                )}
                                {isLoading && (
                                     <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-800/50 space-y-3 animate-pulse p-3">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <label htmlFor="strictness-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rewrite Strictness: <span className="font-normal text-xs">({strictness.toFixed(1)})</span></label>
                        <input type="range" id="strictness-slider" min="0.5" max="1.0" step="0.1" value={strictness} onChange={e => setStrictness(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>More Faithful</span>
                            <span>More Creative</span>
                        </div>
                    </div>
                    {error && <Alert message={error} type="error" />}
                    <div className="flex justify-between items-center pt-2">
                        <Button onClick={handleClear} disabled={isLoading} className="bg-gray-500 hover:bg-gray-600">
                            <TrashIcon className="w-4 h-4 mr-2" /> Clear
                        </Button>
                        <Button onClick={handleRewrite} isLoading={isLoading} disabled={!inputText.trim()}>
                            Rewrite Text
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}