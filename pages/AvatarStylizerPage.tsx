
import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Spinner } from '../components/common';
import { UserCircleIcon, ArrowDownTrayIcon } from '../components/Icons';
import { generateAvatarFromImage } from '../services/geminiService';

const STYLES = [
    "3D Render", "Anime", "Comic Book", "Pixar Style", "Claymation", "Voxel Art", "Fantasy Portrait", "Synthwave"
];

const fileToBase64 = (file: File): Promise<{base64: string, dataUrl: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const [meta, base64] = dataUrl.split(',');
            const mimeType = meta.split(':')[1].split(';')[0];
            resolve({ base64, dataUrl, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};


export default function AvatarStylizerPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
    
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

    const handleGenerate = useCallback(async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);
        
        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            const generatedImageBase64 = await generateAvatarFromImage(base64, mimeType, selectedStyle);
            setResultImage(`data:image/jpeg;base64,${generatedImageBase64}`);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, selectedStyle]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Card title="Avatar Stylizer" icon={<UserCircleIcon className="w-6 h-6" />}>
                 <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload a photo of yourself and choose a style to generate a unique avatar.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <div className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
                                <input type="file" id="image-upload" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} disabled={isLoading} />
                                <label htmlFor="image-upload" className={`font-medium text-primary-600 dark:text-primary-400 ${isLoading ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:text-primary-500'}`}>
                                    {imageFile ? `Selected: ${imageFile.name}` : 'Choose an image'}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                            </div>
                             <div className="space-y-2">
                                <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Choose a Style</label>
                                <select
                                    id="style-select"
                                    value={selectedStyle}
                                    onChange={e => setSelectedStyle(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                    disabled={isLoading}
                                >
                                    {STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 min-h-[200px]">
                            {originalImage ? (
                                 <img src={originalImage} alt="Original" className="max-w-full max-h-56 rounded-md shadow-md" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <UserCircleIcon className="w-16 h-16 mx-auto opacity-20"/>
                                    <p className="mt-2 text-sm">Upload an image to see a preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleGenerate} isLoading={isLoading} disabled={!imageFile}>
                            Stylize Avatar
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || resultImage) && (
                <Card title="Your New Avatar">
                    <div className="flex flex-col justify-center items-center rounded-lg p-4 min-h-[300px] space-y-4">
                        {isLoading && <Spinner />}
                        {resultImage && (
                            <>
                                <img src={resultImage} alt="Generated Avatar" className="max-w-full max-h-[70vh] w-80 h-80 rounded-full shadow-lg object-cover" />
                                <a
                                    href={resultImage}
                                    download="stylized-avatar.jpg"
                                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                >
                                   <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                   Download Avatar
                                </a>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}