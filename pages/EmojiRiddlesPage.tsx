
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { PuzzlePieceIcon, SparklesIcon, ForwardIcon } from '../components/Icons';
import { getEmojiRiddle } from '../services/geminiService';
import { type EmojiRiddle } from '../types';

export default function EmojiRiddlesPage() {
    const [riddle, setRiddle] = useState<EmojiRiddle | null>(null);
    const [guess, setGuess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNewRiddle = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGuess('');
        try {
            const newRiddle = await getEmojiRiddle();
            setRiddle(newRiddle);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNewRiddle();
    }, [fetchNewRiddle]);

    const handleGuessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guess.trim() || !riddle) return;

        if (guess.trim().toLowerCase() === riddle.answer.toLowerCase()) {
            toast.success("Correct! 🎉 Let's try another one.");
            fetchNewRiddle();
        } else {
            toast.error("Not quite! Try again. 🤔");
        }
    };
    
    const handleRevealAnswer = () => {
        if (!riddle) return;
        toast.success(`The answer was: ${riddle.answer}`, { duration: 4000 });
        fetchNewRiddle();
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Card title="Emoji Riddles" icon={<PuzzlePieceIcon className="w-6 h-6" />}>
                <div className="flex flex-col items-center justify-center space-y-6 p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Can you solve the riddle based on the emojis?
                    </p>

                    <div className="w-full min-h-[80px] flex items-center justify-center">
                        {isLoading ? (
                            <div className="animate-pulse text-5xl">🤔</div>
                        ) : error ? (
                             <Alert message={error} type="error" />
                        ) : (
                            <p className="text-5xl md:text-6xl tracking-widest animate-fade-in">{riddle?.riddle}</p>
                        )}
                    </div>
                    
                    <form onSubmit={handleGuessSubmit} className="w-full max-w-sm space-y-4">
                        <input
                            type="text"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            className="block w-full text-center rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Your answer..."
                            disabled={isLoading}
                        />
                         <Button type="submit" isLoading={isLoading} disabled={isLoading || !guess.trim()} className="w-full">
                            Submit Guess
                        </Button>
                    </form>

                    <div className="flex items-center space-x-4 pt-4">
                        <Button onClick={fetchNewRiddle} disabled={isLoading} className="bg-gray-500 hover:bg-gray-600">
                            <SparklesIcon className="w-5 h-5 mr-2" /> New Riddle
                        </Button>
                        <Button onClick={handleRevealAnswer} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
                            <ForwardIcon className="w-5 h-5 mr-2" /> Reveal Answer
                        </Button>
                    </div>

                </div>
            </Card>
        </div>
    );
}