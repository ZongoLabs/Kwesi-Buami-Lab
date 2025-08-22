
import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { MegaphoneIcon, ClipboardDocumentIcon } from '../components/Icons';
import { generateMarketingCopy } from '../services/geminiService';

const COPY_TYPES = ['Tweet (short & punchy)', 'Facebook Ad (engaging)', 'Email Subject Line', 'Product Tagline', 'Ad Headline'];

export default function MarketingCopywriterPage() {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [copyType, setCopyType] = useState(COPY_TYPES[0]);
    const [generatedCopy, setGeneratedCopy] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!productName.trim() || !description.trim()) {
            setError('Please provide both a product name and description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedCopy('');
        try {
            const result = await generateMarketingCopy(productName, description, copyType);
            setGeneratedCopy(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [productName, description, copyType]);

    const handleCopy = () => {
        if (!generatedCopy) return;
        navigator.clipboard.writeText(generatedCopy);
        toast.success('Copy saved to clipboard!');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Marketing Copy Generator" icon={<MegaphoneIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Describe your product and select a format to generate compelling marketing copy instantly.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Product Name
                        </label>
                        <input
                            type="text"
                            id="product-name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., OmniTools Suite"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Product Description
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., An AI-powered suite of productivity tools..."
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="copy-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type of Copy
                        </label>
                        <select
                            id="copy-type"
                            value={copyType}
                            onChange={e => setCopyType(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        >
                            {COPY_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleGenerate} isLoading={isLoading} disabled={!productName.trim() || !description.trim()}>
                            Generate Copy
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || generatedCopy) && (
                 <Card>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Generated Copy</h3>
                    {isLoading && (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    )}
                    {generatedCopy && (
                        <div className="relative">
                            <textarea
                                value={generatedCopy}
                                readOnly
                                rows={6}
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