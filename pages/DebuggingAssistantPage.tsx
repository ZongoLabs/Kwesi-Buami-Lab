
import React, { useState, useCallback } from 'react';
import { Card, Button, Alert } from '../components/common';
import { BugAntIcon } from '../components/Icons';
import { debugCode } from '../services/geminiService';
import { type DebugResult } from '../types';

const CodeBlock = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-lg relative group">
            <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 text-gray-400 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-gray-200 font-mono whitespace-pre-wrap">{code}</code>
            </pre>
        </div>
    );
};

export default function DebuggingAssistantPage() {
    const [codeSnippet, setCodeSnippet] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState<DebugResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDebug = useCallback(async () => {
        if (!codeSnippet.trim()) {
            setError('Please enter a code snippet to debug.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const debugResult = await debugCode(codeSnippet, errorMessage);
            setResult(debugResult);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [codeSnippet, errorMessage]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Code Debugger" icon={<BugAntIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste your code and its error message to get an explanation and a suggested fix.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="code-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Code Snippet
                        </label>
                        <textarea
                            id="code-input"
                            rows={8}
                            value={codeSnippet}
                            onChange={(e) => setCodeSnippet(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono"
                            placeholder="Paste your code here..."
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="error-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Error Message (optional)
                        </label>
                        <textarea
                            id="error-input"
                            rows={3}
                            value={errorMessage}
                            onChange={(e) => setErrorMessage(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Paste the error message here..."
                            disabled={isLoading}
                        />
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleDebug} isLoading={isLoading} disabled={!codeSnippet.trim()}>
                            Debug Code
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || result) && (
                 <Card>
                    <div className="space-y-6">
                        {isLoading && (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                            </div>
                        )}
                        {result && (
                            <>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Explanation</h4>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{result.explanation}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Suggested Fix</h4>
                                    <CodeBlock code={result.fixedCode} />
                                </div>
                            </>
                        )}
                    </div>
                 </Card>
            )}
        </div>
    );
}