
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Alert, Spinner } from '../components/common';
import { GlobeAltIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PlayIcon, PauseIcon, StopIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { generateHistoryStory } from '../services/geminiService';
import { type HistoryStory } from '../types';

const SUGGESTED_TOPICS = [
    "The Rise and Fall of the Roman Empire", "The Ancient Egyptians and the Pyramids", "The Silk Road and ancient trade", "The life of Leonardo da Vinci", "The American Revolution", "The Industrial Revolution", "World War I", "The Roaring Twenties", "The Space Race", "The invention of the internet"
];

export default function WorldHistoryPage() {
    const [topic, setTopic] = useState('');
    const [story, setStory] = useState<HistoryStory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const handleGenerateStory = useCallback(async (currentTopic: string) => {
        if (!currentTopic.trim()) {
            setError('Please enter a topic.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setStory(null);
        window.speechSynthesis.cancel();
        
        try {
            const result = await generateHistoryStory(currentTopic);
            setStory(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleTopicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleGenerateStory(topic);
    };

    const handlePlay = useCallback(() => {
        if (!story || typeof window.speechSynthesis === 'undefined') return;

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(story.narrative);
        utteranceRef.current = utterance;

        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
        if (voice) utterance.voice = voice;
        utterance.volume = isMuted ? 0 : 1;
        
        utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
        utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
        utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
        
        window.speechSynthesis.speak(utterance);
    }, [story, isPaused, isMuted]);

    useEffect(() => {
        if (story && !isLoading) {
            handlePlay();
        }
         // Cleanup function to cancel speech when component unmounts
        return () => {
             window.speechSynthesis.cancel();
        }
    }, [story, isLoading, handlePlay]);
    
    const handlePause = () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };
    
    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (utteranceRef.current) {
            utteranceRef.current.volume = newMutedState ? 0 : 1;
        }
    };

    const scrollSuggestions = (direction: 'left' | 'right') => {
        if (suggestionsRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            suggestionsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="History Storyteller" icon={<GlobeAltIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter any historical event, figure, or period to hear its story.
                    </p>
                    <form onSubmit={handleTopicSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., The Industrial Revolution"
                            disabled={isLoading}
                        />
                         <Button type="submit" isLoading={isLoading} disabled={!topic.trim()}>
                            Tell Story
                        </Button>
                    </form>

                     <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Or choose a topic:</label>
                        <div className="relative flex items-center">
                             <button onClick={() => scrollSuggestions('left')} className="absolute -left-4 z-10 p-1 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm"><ChevronLeftIcon className="w-5 h-5" /></button>
                             <div ref={suggestionsRef} className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                {SUGGESTED_TOPICS.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => {setTopic(t); handleGenerateStory(t);}}
                                        disabled={isLoading}
                                        className="text-nowrap px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => scrollSuggestions('right')} className="absolute -right-4 z-10 p-1 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm"><ChevronRightIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                     {error && <Alert message={error} type="error" />}
                </div>
            </Card>

            {(isLoading || story) && (
                 <Card>
                    {isLoading ? <Spinner/> : story && (
                        <article className="prose prose-gray dark:prose-invert max-w-none">
                            <h2>{story.title}</h2>
                            <div className="sticky top-16 z-10 flex items-center gap-2 p-2 mb-4 -mx-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border dark:border-gray-700">
                                <button onClick={toggleMute} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                    {isMuted ? <SpeakerXMarkIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>}
                                </button>
                                {!isSpeaking || isPaused ? (
                                    <button onClick={handlePlay} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                        <PlayIcon className="w-5 h-5"/>
                                    </button>
                                ) : (
                                    <button onClick={handlePause} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                        <PauseIcon className="w-5 h-5"/>
                                    </button>
                                )}
                                 <button onClick={handleStop} disabled={!isSpeaking} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-50">
                                    <StopIcon className="w-5 h-5"/>
                                </button>
                                <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                                    {isSpeaking && !isPaused ? 'Narrating...' : isPaused ? 'Paused' : 'Ready to play'}
                                </div>
                            </div>
                            {story.narrative.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </article>
                    )}
                 </Card>
            )}
        </div>
    );
}