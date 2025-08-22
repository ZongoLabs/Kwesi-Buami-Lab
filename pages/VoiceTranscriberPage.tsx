import React, { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { MicrophoneIcon, StopIcon, ClipboardDocumentIcon, ArrowDownTrayIcon } from '../components/Icons';
import { transcribeAudio } from '../services/geminiService';

const blobToBase64 = (blob: Blob): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            const result = reader.result as string;
            const [meta, data] = result.split(',');
            const mimeType = meta.split(':')[1].split(';')[0];
            resolve({ base64: data, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};


export default function VoiceTranscriberPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleTranscription = useCallback(async (audioBlob: Blob) => {
        setIsLoading(true);
        setError(null);
        setTranscribedText('');
        try {
            const { base64, mimeType } = await blobToBase64(audioBlob);
            const result = await transcribeAudio(base64, mimeType);
            setTranscribedText(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const startRecording = async () => {
        setError(null);
        setTranscribedText('');
        setAudioUrl(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0].type });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                handleTranscription(audioBlob);
                audioChunksRef.current = [];
                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please ensure permission is granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const handleCopy = () => {
        if (!transcribedText) return;
        navigator.clipboard.writeText(transcribedText);
        toast.success("Transcript copied to clipboard!");
    };
    
    const handleDownload = () => {
        if (!transcribedText) return;
        const blob = new Blob([transcribedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcript.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Voice Transcriber" icon={<MicrophoneIcon className="w-6 h-6" />}>
                <div className="flex flex-col items-center justify-center space-y-6 p-6">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        {isRecording ? "Recording in progress... Click stop when you're done." : "Click the button to start recording your voice."}
                    </p>
                    
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="flex items-center justify-center w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-400"
                            aria-label="Start Recording"
                        >
                            <MicrophoneIcon className="w-10 h-10" />
                        </button>
                    ) : (
                         <button
                            onClick={stopRecording}
                            className="flex items-center justify-center w-24 h-24 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg transition-all animate-pulse"
                            aria-label="Stop Recording"
                        >
                            <StopIcon className="w-10 h-10" />
                        </button>
                    )}
                    {error && <Alert message={error} type="error" />}
                </div>
            </Card>

            {(isLoading || transcribedText || audioUrl) && (
                 <Card>
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Transcription Result</h3>
                         {!isLoading && transcribedText && (
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
                    {audioUrl && !isLoading && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Recording</h3>
                            <audio controls src={audioUrl} className="w-full"></audio>
                        </div>
                    )}
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transcript</h3>
                    {isLoading && (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    )}
                    {transcribedText && (
                        <textarea
                            value={transcribedText}
                            onChange={(e) => setTranscribedText(e.target.value)}
                            rows={10}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                        />
                    )}
                 </Card>
            )}
        </div>
    );
}