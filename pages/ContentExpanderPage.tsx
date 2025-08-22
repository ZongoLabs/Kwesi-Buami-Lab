import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { ArrowPathIcon, ClipboardDocumentIcon, TrashIcon } from '../components/Icons';
import { expandOrRewriteText } from '../services/geminiService';

type Mode = 'expand' | 'rewrite';
const TONES = ['Formal', 'Casual', 'Professional', 'Creative', 'Technical', 'Simple'];

export default function ContentExpanderPage() {
    const [inputText, setInputText] = useState('');
    const [resultText, setResultText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>('rewrite');
    const [tone, setTone] = useState('Professional');
    const [creativity, setCreativity] = useState(0.7); // Corresponds to temperature
    const [length, setLength] = useState(2); // 1=Slightly, 2=Moderately, 3=Significantly

    const handleProcessText = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to process.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultText('');
        try {
            const result = await expandOrRewriteText(inputText, mode, tone, creativity, length);
            setResultText(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, mode, tone, creativity, length]);

    const handleCopy = () => {
        if (!resultText) return;
        navigator.clipboard.writeText(resultText);
        toast.success("Result copied to clipboard!");
    };
    
    const handleClear = () => {
        setInputText('');
        setResultText('');
        setError(null);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Content Expander & Rewriter" icon={<ArrowPathIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expand on short points to create more detailed content, or rewrite existing text to change its tone.
                    </p>
                    
                    <div className="space-y-4 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Action:</label>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-primary-600 focus:ring-primary-500" name="mode" value="rewrite" checked={mode === 'rewrite'} onChange={() => setMode('rewrite')} />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">Rewrite Text</span>
                                </label>
                                 <label className="inline-flex items-center">
                                    <input type="radio" className="form-radio text-primary-600 focus:ring-primary-500" name="mode" value="expand" checked={mode === 'expand'} onChange={() => setMode('expand')} />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">Expand Text</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Desired Tone
                            </label>
                             <select
                                id="tone-select"
                                value={tone}
                                onChange={e => setTone(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            >
                                {TONES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="creativity-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Creativity: <span className="font-normal">({creativity.toFixed(1)})</span></label>
                             <input type="range" id="creativity-slider" min="0.1" max="1.0" step="0.1" value={creativity} onChange={e => setCreativity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        </div>
                         <div className="space-y-2">
                            <label htmlFor="length-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Length Change: <span className="font-normal">({['Slight', 'Moderate', 'Significant'][length-1]})</span></label>
                            <input type="range" id="length-slider" min="1" max="3" step="1" value={length} onChange={e => setLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Your Text
                        </label>
                        <textarea
                            id="text-input"
                            rows={8}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Enter your text here..."
                            disabled={isLoading}
                        />
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-between items-center">
                        <Button onClick={handleClear} disabled={isLoading} className="bg-gray-500 hover:bg-gray-600">
                            <TrashIcon className="w-4 h-4 mr-2" /> Clear
                        </Button>
                        <Button onClick={handleProcessText} isLoading={isLoading} disabled={!inputText.trim()}>
                            {mode === 'rewrite' ? 'Rewrite Text' : 'Expand Text'}
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || resultText) && (
                 <Card>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Result</h3>
                    </div>
                    {isLoading && (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    )}
                    {resultText && (
                        <div className="relative">
                            <textarea
                                value={resultText}
                                onChange={(e) => setResultText(e.target.value)}
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