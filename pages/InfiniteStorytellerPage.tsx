
import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { BookOpenIcon, SparklesIcon, TrashIcon } from '../components/Icons';
import { continueStory } from '../services/geminiService';
import { type StorySegment } from '../types';

const GENRES = ["Fantasy", "Sci-Fi", "Mystery", "Adventure", "Horror", "Comedy"];

const StoryBubble = ({ segment }: { segment: StorySegment }) => {
    const isStoryteller = segment.author === 'Storyteller';
    return (
        <div className={`flex items-start gap-3 ${isStoryteller ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isStoryteller ? 'bg-primary-500 text-white' : 'bg-gray-500 text-white'}`}>
                {isStoryteller ? <SparklesIcon className="w-5 h-5" /> : '👤'}
            </div>
            <div className={`p-3 rounded-lg max-w-xl ${isStoryteller ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary-100 dark:bg-primary-900/50'}`}>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{segment.text}</p>
            </div>
        </div>
    );
};


export default function InfiniteStorytellerPage() {
    const [story, setStory] = useState<StorySegment[]>([]);
    const [userEntry, setUserEntry] = useState('');
    const [genre, setGenre] = useState(GENRES[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const storyEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        storyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [story]);

    const startNewStory = useCallback(async (selectedGenre: string) => {
        setIsLoading(true);
        setError(null);
        setStory([]);
        setUserEntry('');
        
        try {
            const firstSegment = await continueStory(selectedGenre, "The story is just beginning.");
            setStory([{ author: 'Storyteller', text: firstSegment }]);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setStory([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        startNewStory(genre);
    }, [genre, startNewStory]);

    const handleContinue = async () => {
        if (!userEntry.trim()) {
            toast.error("Please add to the story!");
            return;
        }
        
        const newStoryHistory = [...story, { author: 'You' as const, text: userEntry }];
        setStory(newStoryHistory);
        setUserEntry('');
        setIsLoading(true);
        setError(null);
        
        try {
            const flatStory = newStoryHistory.map(s => `${s.author}: ${s.text}`).join('\n\n');
            const nextSegment = await continueStory(genre, flatStory);
            setStory(prev => [...prev, { author: 'Storyteller', text: nextSegment }]);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Collaborative Storywriter" icon={<BookOpenIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose a genre, and write a story together. Take turns adding to the narrative.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="space-y-2">
                             <label htmlFor="genre-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Story Genre</label>
                            <select
                                id="genre-select"
                                value={genre}
                                onChange={e => setGenre(e.target.value)}
                                className="block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                disabled={isLoading}
                            >
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <Button onClick={() => startNewStory(genre)} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                            <TrashIcon className="w-5 h-5 mr-2" /> Start New Story
                        </Button>
                    </div>
                </div>
            </Card>
            
            <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 sm:p-6 space-y-6 h-[60vh] overflow-y-auto">
                    {story.map((segment, index) => (
                        <StoryBubble key={index} segment={segment} />
                    ))}
                    {isLoading && story.length > 0 && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary-500 text-white animate-pulse">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                            <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                                <p className="text-gray-800 dark:text-gray-200 italic">The storyteller is writing...</p>
                            </div>
                        </div>
                    )}
                     <div ref={storyEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                    {error && <Alert message={error} type="error" />}
                    <div className="flex items-start gap-4">
                        <textarea
                            rows={3}
                            value={userEntry}
                            onChange={(e) => setUserEntry(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Your turn to add to the story..."
                            disabled={isLoading || story.length === 0}
                        />
                         <Button onClick={handleContinue} isLoading={isLoading} disabled={isLoading || !userEntry.trim() || story.length === 0} className="h-full">
                            Continue
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
}