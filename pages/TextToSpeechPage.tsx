

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button } from '../components/common';
import { SpeakerWaveIcon, PlayIcon, PauseIcon, StopIcon, ForwardIcon } from '../components/Icons';

const useLocalStorage = (key: string, initialValue: any) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: any) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

export default function TextToSpeechPage() {
    const [text, setText] = useState('Hello, world! Welcome to OmniTools. I can read any text for you.');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useLocalStorage('tts-voice', '');
    const [rate, setRate] = useLocalStorage('tts-rate', 1);
    const [pitch, setPitch] = useLocalStorage('tts-pitch', 1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState<{ word: number; char: number }>({ word: -1, char: -1 });

    const words = useMemo(() => text.split(/\s+/), [text]);

    const populateVoiceList = useCallback(() => {
        const newVoices = window.speechSynthesis.getVoices();
        setVoices(newVoices);
        if(newVoices.length > 0 && !selectedVoiceURI) {
            const defaultVoice = newVoices.find(voice => voice.lang.includes('en') && voice.default) || newVoices[0];
            setSelectedVoiceURI(defaultVoice.voiceURI);
        }
    }, [selectedVoiceURI, setSelectedVoiceURI]);

    useEffect(() => {
        populateVoiceList();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }
        return () => {
             window.speechSynthesis.cancel();
             if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
             }
        }
    }, [populateVoiceList]);
    
    const handleReset = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setHighlightIndex({ word: -1, char: -1 });
    }

    const handlePlay = () => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            return;
        }
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.pitch = pitch;
        utterance.rate = rate;
        
        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onboundary = (event) => {
            const wordIndex = text.substring(0, event.charIndex).split(/\s+/).length - 1;
            setHighlightIndex({ word: wordIndex, char: event.charIndex });
        };
        
        utterance.onend = handleReset;
        utterance.onerror = handleReset;

        window.speechSynthesis.speak(utterance);
    };
    
    const handlePause = () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        handleReset();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleStop();
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target?.result as string;
                setText(fileContent);
            };
            reader.readAsText(file);
        }
    };
    
    const getPlayButton = () => {
        if(isSpeaking && !isPaused) {
            return ( <Button onClick={handlePause} className="w-32 bg-amber-600 hover:bg-amber-700"><PauseIcon className="w-5 h-5 mr-2" /> Pause</Button> );
        }
        if(isPaused) {
            return ( <Button onClick={handlePlay} className="w-32"><ForwardIcon className="w-5 h-5 mr-2" /> Resume</Button> );
        }
        return ( <Button onClick={handlePlay} disabled={!text.trim()} className="w-32"><PlayIcon className="w-5 h-5 mr-2" /> Play</Button> );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Text to Speech & Document Reader" icon={<SpeakerWaveIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Type, paste, or upload a document (.txt, .md). The reader will highlight words as they are spoken.
                    </p>
                    <div className="p-4 border rounded-md bg-white dark:bg-gray-900 min-h-[150px]">
                        <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                             {words.map((word, index) => (
                                <span key={index} className={`${highlightIndex.word === index ? 'bg-primary-200 dark:bg-primary-700/50 rounded' : ''}`}>{word} </span>
                            ))}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Text</label>
                             <label htmlFor="doc-upload" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer">
                                Upload Document
                            </label>
                            <input type="file" id="doc-upload" className="sr-only" accept=".txt,.md" onChange={handleFileChange} />
                        </div>
                        <textarea
                            id="text-input"
                            rows={6}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="Enter text to be read..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                             <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Voice</label>
                            <select
                                id="voice-select"
                                value={selectedVoiceURI}
                                onChange={e => setSelectedVoiceURI(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                disabled={voices.length === 0}
                            >
                                {voices.length === 0 && <option>Loading voices...</option>}
                                {voices.map(voice => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>{`${voice.name} (${voice.lang})`}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="rate-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rate: {rate.toFixed(1)}</label>
                             <input type="range" id="rate-slider" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="pitch-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pitch: {pitch.toFixed(1)}</label>
                            <input type="range" id="pitch-slider" min="0" max="2" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4 pt-4">
                        {getPlayButton()}
                         <Button
                            onClick={handleStop}
                            disabled={!isSpeaking}
                            className="w-32 bg-red-600 hover:bg-red-700"
                        >
                            <StopIcon className="w-5 h-5 mr-2" /> Stop
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}