import React, { useState, useMemo } from 'react';
import { Card } from '../components/common';
import { DocumentTextIcon } from '../components/Icons';

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
);

export default function WordCounterPage() {
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        const trimmedText = text.trim();
        const words = trimmedText ? trimmedText.split(/\s+/).filter(Boolean).length : 0;
        const characters = text.length;
        const sentences = trimmedText.match(/[^.!?]+[.!?]*(\s|$)/g)?.length || 0;
        const paragraphs = trimmedText ? trimmedText.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
        
        // Average reading speed: 200 WPM
        const readingTime = Math.ceil(words / 200);
        // Average speaking speed: 130 WPM
        const speakingTime = Math.ceil(words / 130);

        const formatTime = (minutes: number) => {
            if (minutes < 1) return "< 1 min";
            if (minutes === 1) return "1 min";
            return `${minutes} mins`;
        }

        return { 
            words, 
            characters, 
            sentences, 
            paragraphs,
            readingTime: formatTime(readingTime),
            speakingTime: formatTime(speakingTime),
        };
    }, [text]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Word & Character Counter" icon={<DocumentTextIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paste your text below for a real-time analysis of its length and structure.
                    </p>
                    <div className="space-y-2">
                        <textarea
                            rows={15}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Type or paste your text here..."
                        />
                    </div>
                </div>
            </Card>

            <Card>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard label="Words" value={stats.words} />
                    <StatCard label="Characters" value={stats.characters} />
                    <StatCard label="Sentences" value={stats.sentences} />
                    <StatCard label="Paragraphs" value={stats.paragraphs} />
                    <StatCard label="Reading Time" value={stats.readingTime} />
                    <StatCard label="Speaking Time" value={stats.speakingTime} />
                </div>
            </Card>
        </div>
    );
}