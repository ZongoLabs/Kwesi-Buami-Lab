
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, Button } from '../components/common';
import { EyeDropperIcon, ClipboardDocumentIcon } from '../components/Icons';

const LOUPE_SIZE = 100;
const ZOOM_FACTOR = 3;

export default function ColorPickerPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [pickedColors, setPickedColors] = useState<{ hex: string; rgb: string; hsl: string; }[]>([]);
    const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: string; hsl: string; } | null>(null);
    const [loupePosition, setLoupePosition] = useState({ x: 0, y: 0, visible: false });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loupeCanvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPickedColors([]);
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                setImageSrc(src);
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);
                    }
                };
                img.src = src;
            };
            reader.readAsDataURL(file);
        }
    };

    const getColorAtPosition = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0], g = pixel[1], b = pixel[2];

        // Convert RGB to HEX
        const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        // Convert RGB to HSL
        const r_norm = r / 255, g_norm = g / 255, b_norm = b / 255;
        const max = Math.max(r_norm, g_norm, b_norm), min = Math.min(r_norm, g_norm, b_norm);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
                case g_norm: h = (b_norm - r_norm) / d + 2; break;
                case b_norm: h = (r_norm - g_norm) / d + 4; break;
            }
            h /= 6;
        }
        const hsl = `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;

        return { hex, rgb: `${r}, ${g}, ${b}`, hsl };
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        const color = getColorAtPosition(x, y);
        setHoverColor(color);
        setLoupePosition({ x: e.clientX, y: e.clientY, visible: true });

        // Update loupe
        const loupeCanvas = loupeCanvasRef.current;
        const mainCanvas = canvasRef.current;
        if (loupeCanvas && mainCanvas) {
            const loupeCtx = loupeCanvas.getContext('2d');
            if(loupeCtx) {
                loupeCtx.imageSmoothingEnabled = false;
                loupeCtx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
                loupeCtx.drawImage(
                    mainCanvas,
                    x - (LOUPE_SIZE / ZOOM_FACTOR / 2),
                    y - (LOUPE_SIZE / ZOOM_FACTOR / 2),
                    LOUPE_SIZE / ZOOM_FACTOR,
                    LOUPE_SIZE / ZOOM_FACTOR,
                    0, 0, LOUPE_SIZE, LOUPE_SIZE
                );
            }
        }
    };
    
    const handleMouseLeave = () => {
        setLoupePosition({ ...loupePosition, visible: false });
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        const color = getColorAtPosition(x, y);
        if (color) {
            if (!pickedColors.some(c => c.hex === color.hex)) {
                setPickedColors([...pickedColors, color]);
            }
            navigator.clipboard.writeText(color.hex);
            toast.success(`Copied ${color.hex} to clipboard!`);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Card title="Image Color Picker" icon={<EyeDropperIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload an image and hover over it with the eyedropper to capture any color. Click to add it to your palette.
                    </p>
                    <div className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
                        <input type="file" id="image-upload" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        <label htmlFor="image-upload" className={`font-medium text-primary-600 dark:text-primary-400 cursor-pointer hover:text-primary-500`}>
                            {imageFile ? `Selected: ${imageFile.name}` : 'Choose an image'}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>

                    {imageSrc && (
                        <div className="mt-4 relative flex justify-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <canvas
                                ref={canvasRef}
                                className="max-w-full max-h-[70vh] cursor-crosshair"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onClick={handleClick}
                            />
                            {loupePosition.visible && (
                                <div
                                    className="pointer-events-none absolute border-4 border-white rounded-full shadow-lg overflow-hidden"
                                    style={{
                                        left: `${loupePosition.x - (LOUPE_SIZE/2)}px`,
                                        top: `${loupePosition.y - (LOUPE_SIZE/2)}px`,
                                        width: `${LOUPE_SIZE}px`,
                                        height: `${LOUPE_SIZE}px`,
                                    }}
                                >
                                    <canvas ref={loupeCanvasRef} width={LOUPE_SIZE} height={LOUPE_SIZE} />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-transparent border-2 border-red-500 rounded-full" style={{width: `${ZOOM_FACTOR}px`, height: `${ZOOM_FACTOR}px`}}></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {(hoverColor || pickedColors.length > 0) && (
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hoverColor && (
                             <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Hovered Color</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg border border-gray-300" style={{ backgroundColor: hoverColor.hex }}></div>
                                    <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                        <p>HEX: {hoverColor.hex}</p>
                                        <p>RGB: {hoverColor.rgb}</p>
                                        <p>HSL: {hoverColor.hsl}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {pickedColors.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Picked Colors ({pickedColors.length})</h3>
                                    <Button onClick={() => setPickedColors([])} className="text-xs py-1 px-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Clear</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pickedColors.map(color => (
                                        <div
                                            key={color.hex}
                                            className="w-10 h-10 rounded-full border-2 border-white/50 shadow-md cursor-pointer"
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => { navigator.clipboard.writeText(color.hex); toast.success(`Copied ${color.hex}`); }}
                                            title={`Click to copy ${color.hex}`}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}