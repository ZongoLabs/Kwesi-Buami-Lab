import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Spinner } from '../components/common';
import { PhotoIcon } from '../components/Icons';
import { generateImageFromPrompt } from '../services/geminiService';

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const STYLES = [
    { name: "Default", value: ""},
    { name: "Photorealistic", value: "photorealistic, 8k, sharp focus, detailed" },
    { name: "Anime", value: "anime style, vibrant, key visual" },
    { name: "Fantasy Art", value: "fantasy art, epic, detailed, matte painting" },
    { name: "Vector", value: "vector illustration, graphic art, clean lines" },
    { name: "Watercolor", value: "watercolor painting, soft, blended" }
];

export default function ImageGeneratorPage() {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [style, setStyle] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate an image.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const result = await generateImageFromPrompt(prompt, negativePrompt, aspectRatio, style);
            setGeneratedImage(`data:image/jpeg;base64,${result}`);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, negativePrompt, aspectRatio, style]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Image Generator" icon={<PhotoIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Describe the image you want to create. Be as specific as you can for the best results.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Image Prompt
                        </label>
                        <textarea
                            id="prompt-input"
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., 'A photorealistic image of an astronaut riding a horse on Mars'"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="negative-prompt-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Negative Prompt (optional)
                        </label>
                        <textarea
                            id="negative-prompt-input"
                            rows={2}
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            placeholder="e.g., 'text, watermarks, blurry, low quality'"
                            disabled={isLoading}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Style
                            </label>
                            <select
                                id="style-select"
                                value={style}
                                onChange={e => setStyle(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            >
                                {STYLES.map(s => (
                                    <option key={s.name} value={s.value}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="aspect-ratio-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Aspect Ratio
                            </label>
                             <select
                                id="aspect-ratio-select"
                                value={aspectRatio}
                                onChange={e => setAspectRatio(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            >
                                {ASPECT_RATIOS.map(ratio => (
                                    <option key={ratio} value={ratio}>{ratio}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleGenerate} isLoading={isLoading} disabled={!prompt.trim()}>
                            Generate Image
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || generatedImage) && (
                 <Card title="Generated Image">
                    <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800/50 rounded-lg min-h-[300px] p-4">
                        {isLoading && <Spinner />}
                        {generatedImage && <img src={generatedImage} alt={prompt} className="max-w-full max-h-[70vh] rounded-md shadow-lg" />}
                    </div>
                 </Card>
            )}
        </div>
    );
}