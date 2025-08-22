import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { LanguageIcon, ClipboardDocumentIcon, TrashIcon, ArrowsRightLeftIcon, SpeakerWaveIcon } from '../components/Icons';
import { translateText } from '../services/geminiService';

const LANGUAGES = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese (Mandarin)' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic'},
    { code: 'hi', name: 'Hindi'},
];

export default function LanguageTranslatorPage() {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('en'); // Assuming English input for now
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to translate.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setTranslatedText('');
        try {
            const langName = LANGUAGES.find(l => l.code === targetLanguage)?.name || 'the selected language';
            const result = await translateText(inputText, langName);
            setTranslatedText(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, targetLanguage]);

    const handleCopy = () => {
        if (!translatedText) return;
        navigator.clipboard.writeText(translatedText);
        toast.success('Translation copied to clipboard!');
    };
    
    const handleClear = () => {
        setInputText('');
        setTranslatedText('');
        setError(null);
    };
    
    const handleSwap = () => {
        if (isLoading) return;
        setInputText(translatedText);
        setTranslatedText(inputText);
        // Basic swap, doesn't handle auto-detected language
        setTargetLanguage(sourceLanguage);
        setSourceLanguage(targetLanguage);
    };
    
    const handleSpeak = () => {
        if (!translatedText || typeof window.speechSynthesis === 'undefined') return;
        const utterance = new SpeechSynthesisUtterance(translatedText);
        const targetLangCode = LANGUAGES.find(l => l.code === targetLanguage)?.code;
        if(targetLangCode) {
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang.startsWith(targetLangCode));
            if(voice) utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Language Translator" icon={<LanguageIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter text, select a target language, and get an instant translation.
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full space-y-2">
                            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                From (English)
                            </label>
                            <textarea
                                id="text-input"
                                rows={8}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                placeholder="Enter text here..."
                                disabled={isLoading}
                            />
                        </div>

                        <button onClick={handleSwap} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Swap languages">
                            <ArrowsRightLeftIcon className="w-5 h-5" />
                        </button>

                        <div className="w-full space-y-2">
                            <label htmlFor="lang-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                To
                            </label>
                            <select
                                id="lang-select"
                                value={targetLanguage}
                                onChange={e => setTargetLanguage(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 mb-2"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                            <div className="relative block w-full h-[185px] rounded-md bg-gray-100 dark:bg-gray-800 p-3 overflow-y-auto">
                               {isLoading ? (
                                    <div className="space-y-3 animate-pulse pt-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                    </div>
                               ) : (
                                <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {translatedText}
                                </div>
                               )}
                                {!isLoading && translatedText && (
                                     <div className="absolute top-2 right-2 flex space-x-1">
                                         <Button onClick={handleSpeak} className="p-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <SpeakerWaveIcon className="w-4 h-4" />
                                        </Button>
                                        <Button onClick={handleCopy} className="p-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                                            <ClipboardDocumentIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-between items-center">
                         <Button onClick={handleClear} disabled={isLoading} className="bg-gray-500 hover:bg-gray-600">
                            <TrashIcon className="w-4 h-4 mr-2" /> Clear
                        </Button>
                        <Button onClick={handleTranslate} isLoading={isLoading} disabled={!inputText.trim()}>
                            Translate
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}