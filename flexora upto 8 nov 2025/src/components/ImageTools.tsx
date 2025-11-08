"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    ImagePlus, Download, Sparkles, Crop, Maximize2, Loader2, Type,
    ZoomIn, ZoomOut, Trash2, RotateCcw, Grid, Undo, Redo,
    Lock, Unlock, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Layers, Eye, EyeOff, Move, Sun, Contrast, Droplets
} from "lucide-react";

type AspectRatio = "Free" | "1:1" | "16:9" | "4:3" | "3:2" | "9:16" | "Original";
type CropBox = { x: number; y: number; width: number; height: number };
type ResizeMode = "pixels" | "percentage" | "preset";
type DownloadFormat = "png" | "jpg" | "bmp" | "webp" | "jpeg" | "pdf";
type FontFamily = "Arial" | "Times New Roman" | "Courier New" | "Georgia" | "Verdana" | "Helvetica";
type FontWeight = "normal" | "bold";
type TextAlign = "left" | "center" | "right";

interface TextOverlay {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: FontFamily;
    color: string;
    fontWeight: FontWeight;
    fontStyle: "normal" | "italic";
    textAlign: TextAlign;
    isEditing: boolean;
    isVisible: boolean;
    opacity: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_CANVAS_DIMENSION = 30000;
const MAX_HISTORY_LENGTH = 20;

const PRESET_DIMENSIONS = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "Facebook Cover", width: 820, height: 312 },
    { name: "Twitter Header", width: 1500, height: 500 },
    { name: "LinkedIn Post", width: 1200, height: 627 },
    { name: "Website Banner", width: 1920, height: 600 },
    { name: "Blog Featured", width: 1200, height: 630 },
    { name: "Thumbnail", width: 1280, height: 720 },
];

export default function ImageTools() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState("crop");
    
    // Crop state
    const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, width: 100, height: 100 });
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("Free");
    
    // Resize state
    const [resizeMode, setResizeMode] = useState<ResizeMode>("pixels");
    const [resizeWidth, setResizeWidth] = useState(800);
    const [resizeHeight, setResizeHeight] = useState(600);
    const [resizePercentage, setResizePercentage] = useState(100);
    
    // Adjustments state
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    
    // Text overlay state
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    const [activeTextOverlay, setActiveTextOverlay] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState<FontFamily>("Arial");
    const [textColor, setTextColor] = useState("#000000");
    
    // History state
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "File too large",
                description: "Please select an image under 50MB",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setSelectedImage(event.target?.result as string);
                setOriginalImage(img);
                setCropBox({ x: 0, y: 0, width: img.width, height: img.height });
                setResizeWidth(img.width);
                setResizeHeight(img.height);
                drawImage(img);
                saveToHistory();
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const drawImage = useCallback((img: HTMLImageElement, adjustments?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
    }) => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        // Apply adjustments
        if (adjustments) {
            ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
        }

        ctx.drawImage(img, 0, 0);

        // Draw text overlays
        textOverlays.forEach(overlay => {
            if (overlay.isVisible && overlay.text) {
                ctx.save();
                ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
                ctx.fillStyle = overlay.color;
                ctx.globalAlpha = overlay.opacity / 100;
                ctx.textAlign = overlay.textAlign;
                ctx.fillText(overlay.text, overlay.x, overlay.y);
                ctx.restore();
            }
        });

        ctx.filter = 'none';
    }, [textOverlays]);

    const saveToHistory = useCallback(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        setHistory(prev => {
            const newHistory = prev.slice(0, historyStep + 1);
            newHistory.push(imageData);
            return newHistory.slice(-MAX_HISTORY_LENGTH);
        });
        setHistoryStep(prev => Math.min(prev + 1, MAX_HISTORY_LENGTH - 1));
    }, [historyStep]);

    const applyCrop = () => {
        if (!originalImage || !canvasRef.current) return;
        
        setIsProcessing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        if (!croppedCtx) return;

        croppedCanvas.width = cropBox.width;
        croppedCanvas.height = cropBox.height;

        croppedCtx.drawImage(
            originalImage,
            cropBox.x, cropBox.y, cropBox.width, cropBox.height,
            0, 0, cropBox.width, cropBox.height
        );

        canvas.width = croppedCanvas.width;
        canvas.height = croppedCanvas.height;
        ctx.drawImage(croppedCanvas, 0, 0);

        const newImg = new Image();
        newImg.onload = () => {
            setOriginalImage(newImg);
            saveToHistory();
            setIsProcessing(false);
            toast({ title: "Image cropped successfully" });
        };
        newImg.src = canvas.toDataURL();
    };

    const applyResize = () => {
        if (!originalImage || !canvasRef.current) return;
        
        setIsProcessing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let newWidth = resizeWidth;
        let newHeight = resizeHeight;

        if (resizeMode === "percentage") {
            newWidth = Math.round(originalImage.width * (resizePercentage / 100));
            newHeight = Math.round(originalImage.height * (resizePercentage / 100));
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

        const newImg = new Image();
        newImg.onload = () => {
            setOriginalImage(newImg);
            saveToHistory();
            setIsProcessing(false);
            toast({ title: "Image resized successfully" });
        };
        newImg.src = canvas.toDataURL();
    };

    const applyAdjustments = () => {
        if (!originalImage) return;
        drawImage(originalImage, { brightness, contrast, saturation });
        saveToHistory();
        toast({ title: "Adjustments applied" });
    };

    const addTextOverlay = () => {
        const newOverlay: TextOverlay = {
            id: Date.now().toString(),
            text: "Your Text Here",
            x: 50,
            y: 50,
            fontSize,
            fontFamily,
            color: textColor,
            fontWeight: "normal",
            fontStyle: "normal",
            textAlign: "left",
            isEditing: false,
            isVisible: true,
            opacity: 100,
        };
        setTextOverlays(prev => [...prev, newOverlay]);
        setActiveTextOverlay(newOverlay.id);
    };

    const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
        setTextOverlays(prev => prev.map(overlay => 
            overlay.id === id ? { ...overlay, ...updates } : overlay
        ));
        if (originalImage) {
            drawImage(originalImage, { brightness, contrast, saturation });
        }
    };

    const removeTextOverlay = (id: string) => {
        setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
        if (activeTextOverlay === id) {
            setActiveTextOverlay(null);
        }
        if (originalImage) {
            drawImage(originalImage, { brightness, contrast, saturation });
        }
    };

    const downloadImage = (format: DownloadFormat) => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `edited-image.${format}`;
        
        if (format === 'jpg' || format === 'jpeg') {
            link.href = canvas.toDataURL('image/jpeg', 0.9);
        } else {
            link.href = canvas.toDataURL(`image/${format}`);
        }
        
        link.click();
        toast({ title: "Image downloaded successfully" });
    };

    const resetImage = () => {
        if (!originalImage) return;
        drawImage(originalImage);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setTextOverlays([]);
        saveToHistory();
        toast({ title: "Image reset to original" });
    };

    useEffect(() => {
        if (originalImage) {
            drawImage(originalImage, { brightness, contrast, saturation });
        }
    }, [brightness, contrast, saturation, originalImage, drawImage]);

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">Image Processing Tools</h1>
                    <p className="text-xl text-muted-foreground">
                        Edit, enhance, and transform your images with professional tools
                    </p>
                </div>

                {!selectedImage ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="p-12 text-center">
                            <div className="mb-6">
                                <ImagePlus className="h-16 w-16 mx-auto text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upload an Image</h3>
                            <p className="text-muted-foreground mb-6">
                                Select an image to start editing (Max 50MB)
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Button onClick={() => fileInputRef.current?.click()}>
                                <ImagePlus className="h-4 w-4 mr-2" />
                                Choose Image
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Canvas Area */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="mb-4 flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">Preview</h3>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={resetImage}>
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset
                                            </Button>
                                            <Select onValueChange={(value: DownloadFormat) => downloadImage(value)}>
                                                <SelectTrigger className="w-32">
                                                    <SelectValue placeholder="Download" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="png">PNG</SelectItem>
                                                    <SelectItem value="jpg">JPG</SelectItem>
                                                    <SelectItem value="webp">WebP</SelectItem>
                                                    <SelectItem value="bmp">BMP</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg overflow-auto max-h-[600px] bg-muted/10">
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full h-auto"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tools Panel */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardContent className="p-6">
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-2 mb-6">
                                            <TabsTrigger value="crop">Crop</TabsTrigger>
                                            <TabsTrigger value="resize">Resize</TabsTrigger>
                                            <TabsTrigger value="adjust">Adjust</TabsTrigger>
                                            <TabsTrigger value="text">Text</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="crop" className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Aspect Ratio</label>
                                                <Select value={aspectRatio} onValueChange={(value: AspectRatio) => setAspectRatio(value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Free">Free</SelectItem>
                                                        <SelectItem value="1:1">1:1</SelectItem>
                                                        <SelectItem value="16:9">16:9</SelectItem>
                                                        <SelectItem value="4:3">4:3</SelectItem>
                                                        <SelectItem value="3:2">3:2</SelectItem>
                                                        <SelectItem value="9:16">9:16</SelectItem>
                                                        <SelectItem value="Original">Original</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button onClick={applyCrop} disabled={isProcessing} className="w-full">
                                                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Crop className="h-4 w-4 mr-2" />}
                                                Apply Crop
                                            </Button>
                                        </TabsContent>

                                        <TabsContent value="resize" className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Resize Mode</label>
                                                <Select value={resizeMode} onValueChange={(value: ResizeMode) => setResizeMode(value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pixels">Pixels</SelectItem>
                                                        <SelectItem value="percentage">Percentage</SelectItem>
                                                        <SelectItem value="preset">Preset</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {resizeMode === "pixels" && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-sm font-medium">Width</label>
                                                        <Input
                                                            type="number"
                                                            value={resizeWidth}
                                                            onChange={(e) => setResizeWidth(Number(e.target.value))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Height</label>
                                                        <Input
                                                            type="number"
                                                            value={resizeHeight}
                                                            onChange={(e) => setResizeHeight(Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {resizeMode === "percentage" && (
                                                <div>
                                                    <label className="text-sm font-medium">Percentage: {resizePercentage}%</label>
                                                    <Slider
                                                        value={[resizePercentage]}
                                                        onValueChange={(value) => setResizePercentage(value[0])}
                                                        min={10}
                                                        max={200}
                                                        step={5}
                                                    />
                                                </div>
                                            )}

                                            {resizeMode === "preset" && (
                                                <div>
                                                    <label className="text-sm font-medium">Preset</label>
                                                    <Select>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose preset" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PRESET_DIMENSIONS.map((preset) => (
                                                                <SelectItem key={preset.name} value={preset.name}>
                                                                    {preset.name} ({preset.width}x{preset.height})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <Button onClick={applyResize} disabled={isProcessing} className="w-full">
                                                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                                                Apply Resize
                                            </Button>
                                        </TabsContent>

                                        <TabsContent value="adjust" className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Brightness: {brightness}%</label>
                                                <Slider
                                                    value={[brightness]}
                                                    onValueChange={(value) => setBrightness(value[0])}
                                                    min={0}
                                                    max={200}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Contrast: {contrast}%</label>
                                                <Slider
                                                    value={[contrast]}
                                                    onValueChange={(value) => setContrast(value[0])}
                                                    min={0}
                                                    max={200}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Saturation: {saturation}%</label>
                                                <Slider
                                                    value={[saturation]}
                                                    onValueChange={(value) => setSaturation(value[0])}
                                                    min={0}
                                                    max={200}
                                                />
                                            </div>
                                            <Button onClick={applyAdjustments} className="w-full">
                                                <Contrast className="h-4 w-4 mr-2" />
                                                Apply Adjustments
                                            </Button>
                                        </TabsContent>

                                        <TabsContent value="text" className="space-y-4">
                                            <Button onClick={addTextOverlay} className="w-full">
                                                <Type className="h-4 w-4 mr-2" />
                                                Add Text
                                            </Button>

                                            {textOverlays.map((overlay) => (
                                                <div key={overlay.id} className="p-3 border rounded-lg space-y-2">
                                                    <Input
                                                        value={overlay.text}
                                                        onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                                                        placeholder="Enter text"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs font-medium">Font Size</label>
                                                            <Input
                                                                type="number"
                                                                value={overlay.fontSize}
                                                                onChange={(e) => updateTextOverlay(overlay.id, { fontSize: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium">Color</label>
                                                            <Input
                                                                type="color"
                                                                value={overlay.color}
                                                                onChange={(e) => updateTextOverlay(overlay.id, { color: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeTextOverlay(overlay.id)}
                                                        className="w-full"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}