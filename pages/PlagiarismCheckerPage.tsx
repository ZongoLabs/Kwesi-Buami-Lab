
import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Spinner } from '../components/common';
import { ShieldCheckIcon } from '../components/Icons';
import { checkPlagiarism } from '../services/geminiService';
import { type PlagiarismResult } from '../types';

const SourceCard = ({ source }: { source: PlagiarismResult['sources'][0] }) => (
    <a 
        href={source.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
        <p className="font-semibold text-primary-600 dark:text-primary-400 truncate">{source.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{source.url}</p>
    </a>
);

export default function PlagiarismCheckerPage() {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<PlagiarismResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to check.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const checkResult = await checkPlagiarism(inputText);
            setResult(checkResult);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Plagiarism Checker" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste your text to scan for potential plagiarism against web sources.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Your Text
                        </label>
                        <textarea
                            id="text-input"
                            rows={10}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Paste your text here to check for originality..."
                            disabled={isLoading}
                        />
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleCheck} isLoading={isLoading} disabled={!inputText.trim()}>
                            Check for Plagiarism
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || result) && (
                 <Card>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Check Results</h3>
                     <div className="space-y-6">
                        {isLoading && <Spinner />}
                        {result && (
                            <>
                                <div>
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Summary</h4>
                                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{result.summary}</p>
                                </div>
                                {result.sources.length > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Potential Sources Found</h4>
                                        <div className="space-y-2">
                                            {result.sources.map((source, index) => (
                                                <SourceCard key={index} source={source} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                 </Card>
            )}
        </div>
    );
}