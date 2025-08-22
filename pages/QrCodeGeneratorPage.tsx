
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../components/common';
import { QrCodeIcon, ArrowDownTrayIcon } from '../components/Icons';

declare var QRCode: any;

const correctionLevels = [
    { name: 'Low (L)', value: 'L' },
    { name: 'Medium (M)', value: 'M' },
    { name: 'Quartile (Q)', value: 'Q' },
    { name: 'High (H)', value: 'H' },
];

export default function QrCodeGeneratorPage() {
    const [text, setText] = useState('https://www.google.com');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoSrc, setLogoSrc] = useState<string | null>(null);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#ffffff');
    const [correctLevel, setCorrectLevel] = useState('H');

    useEffect(() => {
        if (qrCodeRef.current) {
            qrCodeRef.current.innerHTML = '';
            if (text.trim() === '') {
                 setQrCodeDataUrl(null);
                 return;
            }
            const qrcode = new QRCode(qrCodeRef.current, {
                text: text,
                width: 256,
                height: 256,
                colorDark: colorDark,
                colorLight: colorLight,
                // @ts-ignore
                correctLevel: QRCode.CorrectLevel[correctLevel]
            });
            
            setTimeout(() => {
                const canvas = qrCodeRef.current?.querySelector('canvas');
                if (canvas) {
                    if (logoSrc) {
                        const ctx = canvas.getContext('2d');
                        const logoImg = new Image();
                        logoImg.onload = () => {
                            const logoSize = canvas.width * 0.2; // 20% of QR code size
                            const logoX = (canvas.width - logoSize) / 2;
                            const logoY = (canvas.height - logoSize) / 2;
                            ctx?.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                            setQrCodeDataUrl(canvas.toDataURL('image/png'));
                        }
                        logoImg.src = logoSrc;
                    } else {
                        setQrCodeDataUrl(canvas.toDataURL('image/png'));
                    }
                }
            }, 100);
        }
    }, [text, colorDark, colorLight, correctLevel, logoSrc]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogoSrc(event.target?.result as string);
            }
            reader.readAsDataURL(file);
        }
    };
    
    const removeLogo = () => {
        setLogoFile(null);
        setLogoSrc(null);
    }

    const handleDownload = () => {
        if(qrCodeDataUrl) {
            const a = document.createElement('a');
            a.href = qrCodeDataUrl;
            a.download = 'qrcode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto flex flex-col lg:flex-row lg:space-y-0 lg:space-x-6">
            <div className="lg:w-1/2 flex-shrink-0">
                <Card title="QR Code Settings" icon={<QrCodeIcon className="w-6 h-6" />}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="qr-text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Your Text or URL
                            </label>
                            <textarea
                                id="qr-text-input"
                                rows={4}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                                placeholder="Enter text or URL..."
                            />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="color-dark" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code Color</label>
                                <input type="color" id="color-dark" value={colorDark} onChange={e => setColorDark(e.target.value)} className="w-full h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                             <div className="space-y-2">
                                <label htmlFor="color-light" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background</label>
                                <input type="color" id="color-light" value={colorLight} onChange={e => setColorLight(e.target.value)} className="w-full h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="correct-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Error Correction</label>
                            <select
                                id="correct-level"
                                value={correctLevel}
                                onChange={e => setCorrectLevel(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            >
                                {correctionLevels.map(level => (
                                    <option key={level.value} value={level.value}>{level.name}</option>
                                ))}
                            </select>
                        </div>
                         <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Embed Logo (optional)</label>
                             <div className="flex items-center gap-2">
                                 <input type="file" id="logo-upload" className="sr-only" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                                 <label htmlFor="logo-upload" className="w-full text-center px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                     {logoFile ? logoFile.name : 'Choose Logo'}
                                 </label>
                                 {logoFile && <Button onClick={removeLogo} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-xs">X</Button>}
                             </div>
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="lg:w-1/2">
                <Card>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-white rounded-lg shadow-inner w-[288px] h-[288px] flex items-center justify-center">
                             {text.trim() === '' ? (
                                <div className="text-center text-gray-400">
                                    <QrCodeIcon className="w-16 h-16 mx-auto opacity-20"/>
                                    <p className="mt-2 text-sm">Enter text to generate QR code</p>
                                </div>
                             ) : (
                                <div ref={qrCodeRef}></div>
                             )}
                        </div>
                       
                        {qrCodeDataUrl && (
                             <Button
                                onClick={handleDownload}
                                className="w-full"
                              >
                               <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> Download PNG
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}