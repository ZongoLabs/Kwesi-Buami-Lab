

import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { NewspaperIcon, ClipboardDocumentIcon, ArrowDownTrayIcon } from '../components/Icons';
import { generateArticle } from '../services/geminiService';

const TONES = ['Informative', 'Casual', 'Formal', 'Persuasive', 'Creative', 'Technical'];
const AUDIENCES = ['General', 'Beginners', 'Experts', 'Students'];

export default function ArticleWriterPage() {
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [tone, setTone] = useState(TONES[0]);
    const [audience, setAudience] = useState(AUDIENCES[0]);
    const [article, setArticle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for the article.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setArticle('');
        try {
            const result = await generateArticle(topic, keywords, tone, audience);
            setArticle(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, keywords, tone, audience]);

    const handleCopy = () => {
        if (!article) return;
        navigator.clipboard.writeText(article);
        toast.success("Article copied to clipboard!");
    };
    
    const handleDownload = () => {
        if (!article) return;
        const blob = new Blob([article], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/\s+/g, '_') || 'article'}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Article Writer" icon={<NewspaperIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Provide a topic, some keywords, and a desired tone to have a full article crafted for you.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Article Topic
                        </label>
                        <input
                            type="text"
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., The Future of Renewable Energy"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Keywords (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="keywords"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., solar, wind, battery storage"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tone
                            </label>
                            <select
                                id="tone"
                                value={tone}
                                onChange={e => setTone(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                disabled={isLoading}
                            >
                                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Audience
                            </label>
                            <select
                                id="audience"
                                value={audience}
                                onChange={e => setAudience(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                disabled={isLoading}
                            >
                                {AUDIENCES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleGenerate} isLoading={isLoading} disabled={!topic.trim()}>
                            Generate Article
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || article) && (
                 <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Generated Article</h3>
                         {!isLoading && article && (
                            <div className="flex items-center space-x-2">
                                <Button onClick={handleCopy} className="p-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                </Button>
                                <Button onClick={handleDownload} className="p-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                </Button>
                            </div>
                         )}
                    </div>
                    {isLoading && (
                        <div className="space-y-4 animate-pulse">
                           <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    )}
                    {article && (
                        <textarea
                            value={article}
                            onChange={(e) => setArticle(e.target.value)}
                            rows={20}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                        />
                    )}
                 </Card>
            )}
        </div>
    );
}