import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card } from '../components/common';
import { CaseIcon, ClipboardDocumentIcon, TrashIcon } from '../components/Icons';

type CaseType = 'uppercase' | 'lowercase' | 'titlecase' | 'sentencecase' | 'camelcase' | 'pascalcase' | 'snakecase' | 'kebabcase';

const converters: Record<CaseType, (str: string) => string> = {
    uppercase: (str) => str.toUpperCase(),
    lowercase: (str) => str.toLowerCase(),
    titlecase: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()),
    sentencecase: (str) => str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
    camelcase: (str) => str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (word, index) => {
        if (+word === 0) return ""; // remove spaces
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, ''),
    pascalcase: (str) => str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (word) => {
        if (+word === 0) return "";
        return word.toUpperCase();
    }).replace(/\s+/g, ''),
    snakecase: (str) => str.trim().replace(/\s+/g, '_').toLowerCase(),
    kebabcase: (str) => str.trim().replace(/\s+/g, '-').toLowerCase(),
};

const caseButtons: {id: CaseType, name: string}[] = [
    { id: 'uppercase', name: 'UPPERCASE' },
    { id: 'lowercase', name: 'lowercase' },
    { id: 'titlecase', name: 'Title Case' },
    { id: 'sentencecase', name: 'Sentence case' },
    { id: 'camelcase', name: 'camelCase' },
    { id: 'pascalcase', name: 'PascalCase' },
    { id: 'snakecase', name: 'snake_case' },
    { id: 'kebabcase', name: 'kebab-case' },
];

export default function TestCaseConverterPage() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [activeCase, setActiveCase] = useState<CaseType>('lowercase');

    useEffect(() => {
        if(inputText) {
            const result = converters[activeCase](inputText);
            setOutputText(result);
        } else {
            setOutputText('');
        }
    }, [inputText, activeCase]);

    const handleCaseChange = (caseType: CaseType) => {
        setActiveCase(caseType);
    };

    const copyToClipboard = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        toast.success('Output copied to clipboard!');
    };
    
    const handleClear = () => {
        setInputText('');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Text Case Converter" icon={<CaseIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter your text and choose a case to convert it to. The output updates live.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
                            <textarea
                                id="text-input"
                                rows={10}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                placeholder="Type or paste your text here..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="text-output" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
                            <div className="relative">
                                <textarea
                                    id="text-output"
                                    rows={10}
                                    value={outputText}
                                    readOnly
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                    placeholder="Converted text will appear here..."
                                />
                                <button onClick={copyToClipboard} className="absolute top-2 right-2 text-gray-500 bg-white/50 dark:bg-gray-900/50 hover:text-primary-600 dark:hover:text-primary-400 p-1 rounded-md text-xs">
                                     <ClipboardDocumentIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Convert to:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {caseButtons.map(btn => (
                                <button key={btn.id} onClick={() => handleCaseChange(btn.id)} className={`text-sm w-full text-center p-2 rounded-md transition-colors ${activeCase === btn.id ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                                    {btn.name}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="flex justify-end pt-2">
                        <button onClick={handleClear} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400">
                           <TrashIcon className="w-4 h-4 mr-1" /> Clear Input
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}