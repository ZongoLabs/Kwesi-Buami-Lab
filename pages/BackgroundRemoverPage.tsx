import React, { useState, useCallback, useRef } from 'react';
import { Card, Button, Alert, Spinner } from '../components/common';
import { SparklesIcon, ForwardIcon } from '../components/Icons';
import { generateSubjectSvgPath } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<{base64: string, dataUrl: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve({ base64, dataUrl });
        };
        reader.onerror = error => reject(error);
    });
};

type BgPreview = 'transparent' | 'white' | 'black';

export default function BackgroundRemoverPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [bgPreview, setBgPreview] = useState<BgPreview>('transparent');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setResultImage(null);
            setError(null);
            const { dataUrl } = await fileToBase64(file);
            setOriginalImage(dataUrl);
        }
    };

    const processImageWithAI = useCallback(async (refine: boolean = false) => {
        if (!imageFile || !originalImage) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const { base64 } = await fileToBase64(imageFile);
            const svgPath = await generateSubjectSvgPath(base64, imageFile.type, refine);
            
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            const img = new Image();

            img.onload = () => {
                if (!canvas || !ctx) return;
                
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                ctx.save();
                ctx.scale(img.naturalWidth / 100, img.naturalHeight / 100);
                
                const path = new Path2D(svgPath);
                ctx.clip(path);
                
                ctx.restore();
                ctx.drawImage(img, 0, 0);

                setResultImage(canvas.toDataURL('image/png'));
            };
            img.src = originalImage;

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, originalImage]);

    const bgClasses = {
        'transparent': `bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3e%3cpath d='M0 0h16v16H0z' fill='%23f0f0f0'/%3e%3cpath d='M16 16h16v16H16z' fill='%23f0f0f0'/%3e%3c/svg%3e")]`,
        'white': 'bg-white',
        'black': 'bg-black'
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <canvas ref={canvasRef} className="hidden"></canvas>
            <Card title="Background Remover" icon={<SparklesIcon className="w-6 h-6" />}>
                 <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload an image for automatic background removal, leaving only the main subject.
                    </p>
                    <div className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
                        <input type="file" id="image-upload" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} disabled={isLoading} />
                        <label htmlFor="image-upload" className={`font-medium text-primary-600 dark:text-primary-400 ${isLoading ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:text-primary-500'}`}>
                            {imageFile ? `Selected: ${imageFile.name}` : 'Choose an image'}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>

                    {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end pt-2">
                        <Button onClick={() => processImageWithAI(false)} isLoading={isLoading} disabled={!imageFile}>
                            Remove Background
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {originalImage && (
                    <Card title="Original">
                         <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 min-h-[300px]">
                            <img src={originalImage} alt="Original" className="max-w-full max-h-[50vh] rounded-md shadow-md" />
                         </div>
                    </Card>
                )}
                 {(isLoading || resultImage) && (
                    <Card title="Result">
                         <div className={`flex flex-col justify-center items-center rounded-lg p-4 min-h-[300px] space-y-4 ${bgClasses[bgPreview]}`}>
                            {isLoading && <Spinner />}
                            {resultImage && (
                                <>
                                    <img src={resultImage} alt="Background removed" className="max-w-full max-h-[50vh] rounded-md" />
                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-gray-900/50 p-2 rounded-lg backdrop-blur-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Preview on:</span>
                                            <button onClick={() => setBgPreview('transparent')} className={`w-6 h-6 rounded-full border-2 ${bgPreview === 'transparent' ? 'border-primary-500' : 'border-gray-400'} bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3e%3cpath d='M0 0h16v16H0z' fill='%23f0f0f0'/%3e%3cpath d='M16 16h16v16H16z' fill='%23f0f0f0'/%3e%3c/svg%3e")]`}></button>
                                            <button onClick={() => setBgPreview('white')} className={`w-6 h-6 rounded-full border-2 ${bgPreview === 'white' ? 'border-primary-500' : 'border-gray-400'} bg-white`}></button>
                                            <button onClick={() => setBgPreview('black')} className={`w-6 h-6 rounded-full border-2 ${bgPreview === 'black' ? 'border-primary-500' : 'border-gray-400'} bg-black`}></button>
                                        </div>
                                         <Button onClick={() => processImageWithAI(true)} isLoading={isLoading} className="text-xs py-1 px-2 bg-gray-600 hover:bg-gray-700">
                                            <SparklesIcon className="w-4 h-4 mr-1"/> Refine Edges
                                        </Button>
                                        <a
                                            href={resultImage}
                                            download="background-removed.png"
                                            className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-semibold text-white shadow-sm transition-colors bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                          >
                                           Download PNG
                                        </a>
                                    </div>
                                </>
                            )}
                         </div>
                    </Card>
                )}
            </div>
        </div>
    );
}