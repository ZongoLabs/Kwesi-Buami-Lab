import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Alert } from '../components/common';
import { SwatchIcon, ClipboardDocumentIcon } from '../components/Icons';
import { generatePaletteFromImage } from '../services/geminiService';
import { type ColorPalette } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // remove data:mime/type;base64, part
        };
        reader.onerror = error => reject(error);
    });
};

const hexToRgb = (hex: string) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 'N/A';
};

const hexToHsl = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
};

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy);
        toast.success(`Copied: ${textToCopy}`);
    };
    return (
        <button onClick={handleCopy} className="absolute top-1 right-1 p-1 rounded bg-black/10 hover:bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ClipboardDocumentIcon className="w-4 h-4" />
        </button>
    )
};


const ColorSwatch = ({ hex, name }: { hex: string; name: string }) => (
    <div className="text-center group">
        <div className="w-full h-24 md:h-32 rounded-lg shadow-md transition-transform group-hover:-translate-y-1 relative" style={{ backgroundColor: hex }}>
            <CopyButton textToCopy={hex}/>
        </div>
        <h3 className="mt-2 font-semibold text-sm text-gray-800 dark:text-gray-100">{name}</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono space-y-1 mt-1">
            <p className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer p-0.5" onClick={() => {navigator.clipboard.writeText(hex); toast.success(`Copied: ${hex}`)}}>{hex}</p>
            <p className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer p-0.5" onClick={() => {navigator.clipboard.writeText(`rgb(${hexToRgb(hex)})`); toast.success(`Copied: rgb(${hexToRgb(hex)})`)}}>rgb({hexToRgb(hex)})</p>
            <p className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer p-0.5" onClick={() => {navigator.clipboard.writeText(`hsl(${hexToHsl(hex)})`); toast.success(`Copied: hsl(${hexToHsl(hex)})`)}}>hsl({hexToHsl(hex)})</p>
        </div>
    </div>
);

export default function ColorPalettePage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [palette, setPalette] = useState<ColorPalette | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setPalette(null);
            setError(null);
        }
    };
    
    const handleGeneratePalette = useCallback(async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPalette(null);

        try {
            const base64Image = await fileToBase64(imageFile);
            const result = await generatePaletteFromImage(base64Image, imageFile.type);
            setPalette(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    const exportAsCss = () => {
        if (!palette) return;
        const cssVars = palette.palette.map(color => `  --${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.hex};`).join('\n');
        const cssBlock = `:root {\n${cssVars}\n}`;
        navigator.clipboard.writeText(cssBlock);
        toast.success("CSS variables copied to clipboard!");
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Card title="Color Palette Generator" icon={<SwatchIcon className="w-6 h-6" />}>
                 <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload an image to automatically generate a harmonious color palette.
                    </p>
                    <div className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
                        <input type="file" id="image-upload" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} disabled={isLoading} />
                        <label htmlFor="image-upload" className={`font-medium text-primary-600 dark:text-primary-400 ${isLoading ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer hover:text-primary-500'}`}>
                            {imageFile ? `Selected: ${imageFile.name}` : 'Choose an image'}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>

                    {imagePreview && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview</h3>
                            <img src={imagePreview} alt="Preview" className="max-h-64 w-auto rounded-lg shadow-md mx-auto" />
                        </div>
                    )}

                    {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleGeneratePalette} isLoading={isLoading} disabled={!imageFile}>
                            Generate Palette
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || palette) && (
                 <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Generated Palette</h3>
                        {!isLoading && palette && (
                            <Button onClick={exportAsCss} className="bg-gray-500 hover:bg-gray-600 text-xs">
                                Export as CSS
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="w-full h-24 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mt-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mt-1"></div>
                                </div>
                            ))
                        ) : (
                            palette?.palette.map((color) => (
                                <ColorSwatch key={color.hex} hex={color.hex} name={color.name} />
                            ))
                        )}
                    </div>
                 </Card>
            )}
        </div>
    );
}