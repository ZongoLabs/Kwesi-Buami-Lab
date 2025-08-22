import React, { useState, useCallback } from 'react';
import { Card, Button, Alert } from '../components/common';
import { CodeBracketSquareIcon } from '../components/Icons';
import { generateCodeSnippet } from '../services/geminiService';

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

export default function CodeSnippetGeneratorPage() {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateCode = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for the code you want.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setCode('');
        try {
            const result = await generateCodeSnippet(prompt);
            setCode(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Code Snippet Generator" icon={<CodeBracketSquareIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Describe the function or code snippet you need, and it will be generated for you.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Your Description
                        </label>
                        <textarea
                            id="prompt-input"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., 'A python function to download an image from a URL' or 'A typescript interface for a user profile'"
                            disabled={isLoading}
                        />
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleGenerateCode} isLoading={isLoading} disabled={!prompt.trim()}>
                            Generate Code
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || code) && (
                 <Card title="Generated Code">
                    {isLoading && (
                        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                    )}
                    {code && <CodeBlock code={code} />}
                 </Card>
            )}
        </div>
    );
}