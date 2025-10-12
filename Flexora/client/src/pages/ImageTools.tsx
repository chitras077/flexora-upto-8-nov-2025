import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    ImagePlus, Download, Sparkles, Crop, Maximize2, Loader2, Type,
    ZoomIn, ZoomOut, Trash2, RotateCcw, Grid, Undo, Redo,
    Lock, Unlock, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Layers, Eye, EyeOff, Move
} from "lucide-react";

// Types
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
    strokeColor?: string;
    strokeWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
}

type GridType = "none" | "ruleOfThirds" | "grid" | "diagonal";
type HistoryItem = {
    image: HTMLImageElement;
    state: string;
    objectUrl?: string;
    timestamp: number;
};

// Enhanced Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_CANVAS_DIMENSION = 30000;
const MAX_HISTORY_LENGTH = 20;
const DEBOUNCE_DELAY = 100;
const TEXT_MIN_FONT_SIZE = 8;
const TEXT_MAX_FONT_SIZE = 200;

// Enhanced presets
const PRESET_DIMENSIONS = [
    { name: "Social Media", dimensions: [
            { name: "Instagram Post", width: 1080, height: 1080 },
            { name: "Instagram Story", width: 1080, height: 1920 },
            { name: "Facebook Cover", width: 820, height: 312 },
            { name: "Twitter Header", width: 1500, height: 500 },
            { name: "LinkedIn Post", width: 1200, height: 627 },
        ]},
    { name: "Web & Digital", dimensions: [
            { name: "Website Banner", width: 1920, height: 600 },
            { name: "Blog Featured", width: 1200, height: 630 },
            { name: "Email Header", width: 600, height: 300 },
            { name: "Thumbnail", width: 1280, height: 720 },
        ]},
    { name: "Print", dimensions: [
            { name: "A4 Paper", width: 2480, height: 3508 },
            { name: "Business Card", width: 1050, height: 600 },
            { name: "Photo 4x6", width: 1200, height: 1800 },
            { name: "Photo 5x7", width: 1500, height: 2100 },
        ]},
    { name: "Devices", dimensions: [
            { name: "iPhone 15", width: 1179, height: 2556 },
            { name: "iPad Pro", width: 2048, height: 2732 },
            { name: "Desktop HD", width: 1920, height: 1080 },
            { name: "Desktop 4K", width: 3840, height: 2160 },
        ]}
];

// Custom hooks with enhanced functionality
const useObjectUrlCleanup = () => {
    const objectUrlsRef = useRef<Map<string, number>>(new Map());

    const createObjectUrl = useCallback((blob: Blob): string => {
        const objectUrl = URL.createObjectURL(blob);
        objectUrlsRef.current.set(objectUrl, Date.now());
        return objectUrl;
    }, []);

    const revokeObjectUrl = useCallback((objectUrl: string) => {
        if (objectUrlsRef.current.has(objectUrl)) {
            URL.revokeObjectURL(objectUrl);
            objectUrlsRef.current.delete(objectUrl);
        }
    }, []);

    const cleanupAll = useCallback(() => {
        objectUrlsRef.current.forEach((_, url) => URL.revokeObjectURL(url));
        objectUrlsRef.current.clear();
    }, []);

    const cleanupExpired = useCallback((maxAge: number = 5 * 60 * 1000) => {
        const now = Date.now();
        objectUrlsRef.current.forEach((timestamp, url) => {
            if (now - timestamp > maxAge) {
                URL.revokeObjectURL(url);
                objectUrlsRef.current.delete(url);
            }
        });
    }, []);

    return { createObjectUrl, revokeObjectUrl, cleanupAll, cleanupExpired };
};

const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Error Boundary Component
class ImageEditorErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Image Editor Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
                    <p className="text-red-600">Please refresh the page and try again.</p>
                    <Button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-2"
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Advanced Text Tool Component
const TextToolPanel: React.FC<{
    textOverlays: TextOverlay[];
    activeTextOverlay: string | null;
    onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
    onAddText: () => void;
    onRemoveText: (id: string) => void;
    onRemoveAllText: () => void;
    onSetActiveText: (id: string | null) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    fontFamily: FontFamily;
    setFontFamily: (family: FontFamily) => void;
    textColor: string;
    setTextColor: (color: string) => void;
}> = ({
          textOverlays,
          activeTextOverlay,
          onUpdateText,
          onAddText,
          onRemoveText,
          onRemoveAllText,
          onSetActiveText,
          fontSize,
          setFontSize,
          fontFamily,
          setFontFamily,
          textColor,
          setTextColor
      }) => {
    const activeText = textOverlays.find(t => t.id === activeTextOverlay);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Text Overlays</h3>
                <div className="flex gap-2">
                    <Button onClick={onAddText} size="sm">
                        <Type className="h-4 w-4 mr-1" />
                        Add Text
                    </Button>
                    {textOverlays.length > 0 && (
                        <Button onClick={onRemoveAllText} variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Text List */}
            {textOverlays.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {textOverlays.map(overlay => (
                        <div
                            key={overlay.id}
                            className={`p-2 border rounded-lg cursor-pointer ${
                                activeTextOverlay === overlay.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200'
                            }`}
                            onClick={() => onSetActiveText(overlay.id)}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-sm truncate flex-1">
                                    {overlay.text || "Empty text"}
                                </span>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateText(overlay.id, {
                                                isVisible: !overlay.isVisible
                                            });
                                        }}
                                    >
                                        {overlay.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveText(overlay.id);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Text Properties */}
            {activeText && (
                <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                    <div>
                        <label className="text-sm font-medium">Text Content</label>
                        <Input
                            value={activeText.text}
                            onChange={(e) => onUpdateText(activeText.id, { text: e.target.value })}
                            placeholder="Enter your text here"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm font-medium">Font Size</label>
                            <Input
                                type="number"
                                min={TEXT_MIN_FONT_SIZE}
                                max={TEXT_MAX_FONT_SIZE}
                                value={fontSize}
                                onChange={(e) => {
                                    const size = Math.max(TEXT_MIN_FONT_SIZE, Math.min(TEXT_MAX_FONT_SIZE, Number(e.target.value)));
                                    setFontSize(size);
                                    onUpdateText(activeText.id, { fontSize: size });
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Font Family</label>
                            <Select value={fontFamily} onValueChange={(value: FontFamily) => {
                                setFontFamily(value);
                                onUpdateText(activeText.id, { fontFamily: value });
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                    <SelectItem value="Verdana">Verdana</SelectItem>
                                    <SelectItem value="Courier New">Courier New</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Text Color</label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                type="color"
                                value={textColor}
                                onChange={(e) => {
                                    setTextColor(e.target.value);
                                    onUpdateText(activeText.id, { color: e.target.value });
                                }}
                                className="w-12 h-10 p-1"
                            />
                            <div className="flex-1">
                                <Input
                                    value={textColor}
                                    onChange={(e) => {
                                        setTextColor(e.target.value);
                                        onUpdateText(activeText.id, { color: e.target.value });
                                    }}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={activeText.fontWeight === "bold" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onUpdateText(activeText.id, {
                                fontWeight: activeText.fontWeight === "bold" ? "normal" : "bold"
                            })}
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={activeText.fontStyle === "italic" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onUpdateText(activeText.id, {
                                fontStyle: activeText.fontStyle === "italic" ? "normal" : "italic"
                            })}
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <div className="flex gap-1">
                            <Button
                                variant={activeText.textAlign === "left" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onUpdateText(activeText.id, { textAlign: "left" })}
                            >
                                <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={activeText.textAlign === "center" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onUpdateText(activeText.id, { textAlign: "center" })}
                            >
                                <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={activeText.textAlign === "right" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onUpdateText(activeText.id, { textAlign: "right" })}
                            >
                                <AlignRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Opacity: {activeText.opacity}%
                        </label>
                        <Slider
                            value={[activeText.opacity]}
                            onValueChange={([value]) => onUpdateText(activeText.id, { opacity: value })}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </div>
                </div>
            )}

            {!activeText && textOverlays.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Type className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No text overlays yet</p>
                    <p className="text-sm">Click "Add Text" to get started</p>
                </div>
            )}
        </div>
    );
};

// Main component with enhanced functionality
const ImageTools: React.FC = () => {
    const { toast } = useToast();
    const { createObjectUrl, revokeObjectUrl, cleanupAll, cleanupExpired } = useObjectUrlCleanup();

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const originalImageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const lastDrawTimeRef = useRef<number>(0);

    // State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState("adjustments");
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("jpeg");

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isCalculatingSize, setIsCalculatingSize] = useState(false);
    const [currentOperation, setCurrentOperation] = useState<string>("");

    // Adjustments
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [blur, setBlur] = useState(0);
    const [hue, setHue] = useState(0);
    const [layerOpacity, setLayerOpacity] = useState(100);

    // Transform
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    // Resize
    const [resizeMode, setResizeMode] = useState<ResizeMode>("pixels");
    const [widthPixels, setWidthPixels] = useState(0);
    const [heightPixels, setHeightPixels] = useState(0);
    const [widthPercentage, setWidthPercentage] = useState(100);
    const [heightPercentage, setHeightPercentage] = useState(100);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [originalFileSize, setOriginalFileSize] = useState(0);
    const [currentCanvasSize, setCurrentCanvasSize] = useState(0);

    // Crop
    const [cropBox, setCropBox] = useState<CropBox | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [cropRotation, setCropRotation] = useState(0);
    const [activeGrid, setActiveGrid] = useState<GridType>("ruleOfThirds");
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("Free");

    // Touch and drag states
    const [dragStart, setDragStart] = useState<{x: number; y: number; cropBox: CropBox} | null>(null);
    const [activeHandle, setActiveHandle] = useState<"nw" | "ne" | "sw" | "se" | "move" | null>(null);

    // Enhanced Text Overlay
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    const [activeTextOverlay, setActiveTextOverlay] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState<FontFamily>("Arial");
    const [textColor, setTextColor] = useState("#000000");
    const [isTextDragging, setIsTextDragging] = useState(false);
    const [textDragStart, setTextDragStart] = useState<{x: number; y: number; overlay: TextOverlay} | null>(null);

    // Zoom
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Store original image data for size calculations
    const originalImageDataRef = useRef<ImageData | null>(null);

    // Enhanced Undo/Redo functionality
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Debounced values for performance
    const debouncedBrightness = useDebounce(brightness, DEBOUNCE_DELAY);
    const debouncedContrast = useDebounce(contrast, DEBOUNCE_DELAY);
    const debouncedSaturation = useDebounce(saturation, DEBOUNCE_DELAY);

    // Utility functions
    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const validateDimensions = useCallback((width: number, height: number): boolean => {
        if (width < 1 || height < 1) {
            toast({
                title: "Invalid dimensions",
                description: "Width and height must be at least 1 pixel",
                variant: "destructive"
            });
            return false;
        }
        if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION) {
            toast({
                title: "Dimensions too large",
                description: `Maximum dimension is ${MAX_CANVAS_DIMENSION.toLocaleString()} pixels`,
                variant: "destructive"
            });
            return false;
        }
        return true;
    }, [toast]);

    // Enhanced coordinate transformation
    const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
        if (!canvasRef.current) return { x: 0, y: 0 };

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Account for zoom and pan
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (clientX - rect.left) * scaleX / zoomLevel - panOffset.x;
        const y = (clientY - rect.top) * scaleY / zoomLevel - panOffset.y;

        return { x, y };
    }, [zoomLevel, panOffset]);

    // Grid lines drawing
    const drawGridLines = useCallback((ctx: CanvasRenderingContext2D, cropBox: CropBox) => {
        const { x, y, width, height } = cropBox;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        if (activeGrid === "ruleOfThirds" || activeGrid === "grid") {
            ctx.beginPath();
            ctx.moveTo(x + width / 3, y);
            ctx.lineTo(x + width / 3, y + height);
            ctx.moveTo(x + (2 * width) / 3, y);
            ctx.lineTo(x + (2 * width) / 3, y + height);
            ctx.moveTo(x, y + height / 3);
            ctx.lineTo(x + width, y + height / 3);
            ctx.moveTo(x, y + (2 * height) / 3);
            ctx.lineTo(x + width, y + (2 * height) / 3);
            ctx.stroke();
        }

        if (activeGrid === "grid") {
            for (let i = 1; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(x + (i * width) / 4, y);
                ctx.lineTo(x + (i * width) / 4, y + height);
                ctx.moveTo(x, y + (i * height) / 4);
                ctx.lineTo(x + width, y + (i * height) / 4);
                ctx.stroke();
            }
        }

        if (activeGrid === "diagonal") {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y + height);
            ctx.moveTo(x + width, y);
            ctx.lineTo(x, y + height);
            ctx.stroke();
        }

        ctx.setLineDash([]);
    }, [activeGrid]);

    // Enhanced crop overlay drawing
    const drawCropOverlay = useCallback((ctx: CanvasRenderingContext2D, cropBox: CropBox) => {
        const { x, y, width, height } = cropBox;

        // Draw semi-transparent overlay outside crop area
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, ctx.canvas.width, y); // Top
        ctx.fillRect(0, y, x, height); // Left
        ctx.fillRect(x + width, y, ctx.canvas.width - x - width, height); // Right
        ctx.fillRect(0, y + height, ctx.canvas.width, ctx.canvas.height - y - height); // Bottom

        if (activeGrid !== "none") {
            drawGridLines(ctx, cropBox);
        }

        // Crop box border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, width, height);

        // Resize handles
        const handleSize = 16;
        const handles = [
            { x: x - handleSize/2, y: y - handleSize/2, type: "nw" as const },
            { x: x + width - handleSize/2, y: y - handleSize/2, type: "ne" as const },
            { x: x - handleSize/2, y: y + height - handleSize/2, type: "sw" as const },
            { x: x + width - handleSize/2, y: y + height - handleSize/2, type: "se" as const }
        ];

        handles.forEach(handle => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });

        // Display crop dimensions
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.textBaseline = "top";
        ctx.fillText(
            `${Math.round(width)}×${Math.round(height)}`,
            x + width / 2 - 20,
            y + height + 5
        );
    }, [activeGrid, drawGridLines]);

    // Enhanced canvas drawing with performance optimization
    const drawCanvas = useCallback(() => {
        if (!canvasRef.current || !originalImageRef.current) return;

        // Throttle drawing to 60fps
        const now = Date.now();
        if (now - lastDrawTimeRef.current < 16) { // ~60fps
            return;
        }
        lastDrawTimeRef.current = now;

        // Cancel previous animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            try {
                const canvas = canvasRef.current!;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                const img = originalImageRef.current!;

                // Set canvas dimensions
                canvas.width = Math.min(img.width, MAX_CANVAS_DIMENSION);
                canvas.height = Math.min(img.height, MAX_CANVAS_DIMENSION);

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Apply filters
                ctx.filter = `
                    brightness(${debouncedBrightness}%) 
                    contrast(${debouncedContrast}%) 
                    saturate(${debouncedSaturation}%) 
                    blur(${blur}px) 
                    hue-rotate(${hue}deg)
                `;

                ctx.globalAlpha = layerOpacity / 100;

                // Save context for transformations
                ctx.save();

                // Apply transformations
                const totalRotation = rotation + cropRotation;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((totalRotation * Math.PI) / 180);
                ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

                // Draw image centered
                ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
                ctx.restore();

                // Draw text overlays with enhanced styling
                textOverlays.forEach(overlay => {
                    if (overlay.text.trim() && overlay.isVisible) {
                        ctx.save();

                        // Set text properties
                        const fontStyle = overlay.fontStyle === "italic" ? "italic" : "normal";
                        const fontWeight = overlay.fontWeight === "bold" ? "bold" : "normal";
                        ctx.font = `${fontStyle} ${fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
                        ctx.fillStyle = overlay.color;
                        ctx.globalAlpha = overlay.opacity / 100;
                        ctx.textBaseline = 'top';
                        ctx.textAlign = overlay.textAlign;

                        // Calculate text position based on alignment
                        let x = overlay.x;
                        const textMetrics = ctx.measureText(overlay.text);
                        if (overlay.textAlign === "center") {
                            x = overlay.x - textMetrics.width / 2;
                        } else if (overlay.textAlign === "right") {
                            x = overlay.x - textMetrics.width;
                        }

                        // Add text shadow
                        if (overlay.shadowBlur && overlay.shadowBlur > 0) {
                            ctx.shadowColor = overlay.shadowColor || 'rgba(0, 0, 0, 0.5)';
                            ctx.shadowBlur = overlay.shadowBlur;
                            ctx.shadowOffsetX = 2;
                            ctx.shadowOffsetY = 2;
                        }

                        // Add stroke if configured
                        if (overlay.strokeWidth && overlay.strokeWidth > 0) {
                            ctx.strokeStyle = overlay.strokeColor || '#000000';
                            ctx.lineWidth = overlay.strokeWidth;
                            ctx.strokeText(overlay.text, x, overlay.y);
                        }

                        // Draw text
                        ctx.fillText(overlay.text, x, overlay.y);

                        // Draw selection border if active
                        if (activeTextOverlay === overlay.id) {
                            ctx.strokeStyle = '#3b82f6';
                            ctx.lineWidth = 2;
                            ctx.setLineDash([5, 5]);
                            ctx.strokeRect(
                                x - 5,
                                overlay.y - 5,
                                textMetrics.width + 10,
                                overlay.fontSize + 10
                            );
                            ctx.setLineDash([]);
                        }

                        ctx.restore();
                    }
                });

                // Draw crop overlay
                if (isCropping && cropBox) {
                    drawCropOverlay(ctx, cropBox);
                }
            } catch (error) {
                console.error("Error drawing canvas:", error);
                toast({
                    title: "Error displaying image",
                    description: "Please try uploading the image again",
                    variant: "destructive"
                });
            }
        });
    }, [
        debouncedBrightness, debouncedContrast, debouncedSaturation, blur, hue, layerOpacity,
        rotation, flipH, flipV, cropRotation, textOverlays, activeTextOverlay, isCropping,
        cropBox, toast, drawCropOverlay
    ]);

    // Enhanced history management with proper cleanup
    const addToHistory = useCallback((image: HTMLImageElement, stateDescription: string, objectUrl?: string) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);

            // Clean up object URLs that will be removed from history
            const removedItems = prev.slice(historyIndex + 1);
            removedItems.forEach(item => {
                if (item.objectUrl) {
                    revokeObjectUrl(item.objectUrl);
                }
            });

            newHistory.push({
                image,
                state: stateDescription,
                objectUrl,
                timestamp: Date.now()
            });

            if (newHistory.length > MAX_HISTORY_LENGTH) {
                const removed = newHistory.shift();
                if (removed?.objectUrl) {
                    revokeObjectUrl(removed.objectUrl);
                }
            }

            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_LENGTH - 1));

        // Clean up expired URLs periodically
        cleanupExpired();
    }, [historyIndex, revokeObjectUrl, cleanupExpired]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const historyItem = history[newIndex];
            if (historyItem && originalImageRef.current) {
                // Clean up current object URL if it exists
                if (selectedImage && selectedImage.startsWith('blob:')) {
                    revokeObjectUrl(selectedImage);
                }

                originalImageRef.current = historyItem.image;
                setSelectedImage(historyItem.objectUrl || null);
                setHistoryIndex(newIndex);
                drawCanvas();
                toast({ title: `Undo: ${historyItem.state}` });
            }
        }
    }, [history, historyIndex, drawCanvas, toast, selectedImage, revokeObjectUrl]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const historyItem = history[newIndex];
            if (historyItem && originalImageRef.current) {
                // Clean up current object URL if it exists
                if (selectedImage && selectedImage.startsWith('blob:')) {
                    revokeObjectUrl(selectedImage);
                }

                originalImageRef.current = historyItem.image;
                setSelectedImage(historyItem.objectUrl || null);
                setHistoryIndex(newIndex);
                drawCanvas();
                toast({ title: `Redo: ${historyItem.state}` });
            }
        }
    }, [history, historyIndex, drawCanvas, toast, selectedImage, revokeObjectUrl]);

    // Enhanced text drag functionality
    const handleTextMouseDown = useCallback((e: React.MouseEvent, overlay: TextOverlay) => {
        if (!canvasRef.current) return;

        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        setTextDragStart({
            x: coords.x,
            y: coords.y,
            overlay: { ...overlay }
        });
        setIsTextDragging(true);
        setActiveTextOverlay(overlay.id);

        e.preventDefault();
        e.stopPropagation();
    }, [getCanvasCoordinates]);

    const handleTextMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isTextDragging || !textDragStart || !activeTextOverlay || !canvasRef.current) return;

        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        const dx = coords.x - textDragStart.x;
        const dy = coords.y - textDragStart.y;

        setTextOverlays(prev =>
            prev.map(overlay =>
                overlay.id === activeTextOverlay
                    ? {
                        ...overlay,
                        x: textDragStart.overlay.x + dx,
                        y: textDragStart.overlay.y + dy
                    }
                    : overlay
            )
        );

        e.preventDefault();
    }, [isTextDragging, textDragStart, activeTextOverlay, getCanvasCoordinates]);

    const handleTextMouseUp = useCallback(() => {
        setIsTextDragging(false);
        setTextDragStart(null);
    }, []);

    // Enhanced touch support for text
    const handleTextTouchStart = useCallback((e: React.TouchEvent, overlay: TextOverlay) => {
        if (!canvasRef.current || e.touches.length !== 1) return;

        const touch = e.touches[0];
        const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
        setTextDragStart({
            x: coords.x,
            y: coords.y,
            overlay: { ...overlay }
        });
        setIsTextDragging(true);
        setActiveTextOverlay(overlay.id);

        e.preventDefault();
    }, [getCanvasCoordinates]);

    const handleTextTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isTextDragging || !textDragStart || !activeTextOverlay || !canvasRef.current) return;

        const touch = e.touches[0];
        const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
        const dx = coords.x - textDragStart.x;
        const dy = coords.y - textDragStart.y;

        setTextOverlays(prev =>
            prev.map(overlay =>
                overlay.id === activeTextOverlay
                    ? {
                        ...overlay,
                        x: textDragStart.overlay.x + dx,
                        y: textDragStart.overlay.y + dy
                    }
                    : overlay
            )
        );

        e.preventDefault();
    }, [isTextDragging, textDragStart, activeTextOverlay, getCanvasCoordinates]);

    const handleTextTouchEnd = useCallback(() => {
        setIsTextDragging(false);
        setTextDragStart(null);
    }, []);

    // Enhanced text management
    const handleAddText = useCallback(() => {
        if (!selectedImage || !canvasRef.current) return;

        const newOverlay: TextOverlay = {
            id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: "Your Text Here",
            x: canvasRef.current.width / 4,
            y: canvasRef.current.height / 4,
            fontSize: fontSize,
            fontFamily: fontFamily,
            color: textColor,
            fontWeight: "normal",
            fontStyle: "normal",
            textAlign: "left",
            isEditing: false,
            isVisible: true,
            opacity: 100
        };

        setTextOverlays(prev => [...prev, newOverlay]);
        setActiveTextOverlay(newOverlay.id);

        // Auto-focus for editing
        setTimeout(() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }, [selectedImage, fontSize, fontFamily, textColor]);

    const updateTextOverlay = useCallback((id: string, updates: Partial<TextOverlay>) => {
        setTextOverlays(prev =>
            prev.map(overlay =>
                overlay.id === id ? { ...overlay, ...updates } : overlay
            )
        );
        // Throttled canvas update
        drawCanvas();
    }, [drawCanvas]);

    const removeTextOverlay = useCallback((id: string) => {
        setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
        if (activeTextOverlay === id) {
            setActiveTextOverlay(null);
        }
        drawCanvas();
        toast({ title: "Text overlay removed" });
    }, [activeTextOverlay, drawCanvas, toast]);

    const removeAllText = useCallback(() => {
        setTextOverlays([]);
        setActiveTextOverlay(null);
        drawCanvas();
        toast({ title: "All text overlays removed" });
    }, [drawCanvas, toast]);

    // File size calculation
    const getCurrentFileSize = useCallback(async (format: DownloadFormat = "jpeg"): Promise<number> => {
        if (!canvasRef.current) return 0;

        return new Promise((resolve) => {
            let mimeType = 'image/jpeg';
            let quality: number | undefined = 0.92;

            switch (format) {
                case "png":
                    mimeType = 'image/png';
                    quality = undefined;
                    break;
                case "webp":
                    mimeType = 'image/webp';
                    quality = 0.95;
                    break;
                case "bmp":
                    mimeType = 'image/bmp';
                    quality = undefined;
                    break;
                case "jpg":
                    quality = 0.95;
                    break;
            }

            canvasRef.current!.toBlob((blob) => {
                resolve(blob?.size || 0);
            }, mimeType, quality);
        });
    }, []);

    const updateFileSizeDisplay = useCallback(async () => {
        if (!selectedImage || !canvasRef.current) return;
        setIsCalculatingSize(true);
        try {
            const size = await getCurrentFileSize("jpeg");
            setCurrentCanvasSize(size);
        } catch (error) {
            console.error("Error calculating file size:", error);
        } finally {
            setIsCalculatingSize(false);
        }
    }, [selectedImage, getCurrentFileSize]);

    // Image loading and processing
    const loadOriginalImage = useCallback((imageData: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (canvasRef.current) {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = Math.min(img.width, MAX_CANVAS_DIMENSION);
                    tempCanvas.height = Math.min(img.height, MAX_CANVAS_DIMENSION);
                    const tempCtx = tempCanvas.getContext('2d');
                    if (tempCtx) {
                        tempCtx.drawImage(img, 0, 0);
                        originalImageDataRef.current = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    }
                }
                resolve(img);
            };
            img.onerror = () => reject(new Error("Failed to load original image"));
            img.src = imageData;
        });
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please select an image file (JPG, PNG, WebP, BMP)",
                variant: "destructive"
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "File too large",
                description: `Please select an image smaller than ${formatFileSize(MAX_FILE_SIZE)}`,
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        setCurrentOperation("Uploading image...");

        try {
            // Clean up previous data
            cleanupAll();
            originalImageRef.current = null;
            originalImageDataRef.current = null;

            setOriginalFileSize(file.size);

            // Use object URL for display
            const objectUrl = createObjectUrl(file);
            const img = await loadOriginalImage(objectUrl);
            originalImageRef.current = img;

            // Validate dimensions
            const initialWidth = Math.min(img.width, MAX_CANVAS_DIMENSION);
            const initialHeight = Math.min(img.height, MAX_CANVAS_DIMENSION);

            if (!validateDimensions(initialWidth, initialHeight)) {
                throw new Error("Invalid image dimensions");
            }

            // Update state
            setSelectedImage(objectUrl);
            setWidthPixels(initialWidth);
            setHeightPixels(initialHeight);
            setWidthPercentage(100);
            setHeightPercentage(100);

            // Reset all states
            setBrightness(100);
            setContrast(100);
            setSaturation(100);
            setBlur(0);
            setHue(0);
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
            setLayerOpacity(100);
            setTextOverlays([]);
            setActiveTextOverlay(null);
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
            setCropRotation(0);

            // Clear history and add initial state
            setHistory([]);
            setHistoryIndex(-1);
            addToHistory(img, "Original image", objectUrl);

            toast({
                title: "Image uploaded successfully!",
                description: `Loaded ${img.width}×${img.height} image (${formatFileSize(file.size)})`
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                title: "Error uploading image",
                description: error instanceof Error ? error.message : "Please try another image",
                variant: "destructive"
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setIsLoading(false);
            setCurrentOperation("");
        }
    };

    // Crop functionality
    const initCropBox = useCallback(() => {
        if (!canvasRef.current || !originalImageRef.current) return;

        const canvas = canvasRef.current;
        const cw = canvas.width;
        const ch = canvas.height;

        let width, height;

        if (aspectRatio === "Original") {
            width = cw;
            height = ch;
        } else {
            width = Math.max(100, Math.min(cw * 0.7, MAX_CANVAS_DIMENSION));
            height = Math.max(100, Math.min(ch * 0.7, MAX_CANVAS_DIMENSION));
        }

        if (aspectRatio !== "Free" && aspectRatio !== "Original") {
            const [wRatio, hRatio] = aspectRatio.split(":").map(Number);
            const targetRatio = wRatio / hRatio;

            if (width / height > targetRatio) {
                width = height * targetRatio;
            } else {
                height = width / targetRatio;
            }
        }

        setCropBox({
            x: (cw - width) / 2,
            y: (ch - height) / 2,
            width: Math.round(width),
            height: Math.round(height)
        });
    }, [aspectRatio]);

    // Enhanced crop confirmation
    const confirmCrop = async () => {
        if (!cropBox || !originalImageRef.current) return;

        setIsLoading(true);
        setCurrentOperation("Cropping image...");

        try {
            const cropWidth = Math.round(Math.min(cropBox.width, MAX_CANVAS_DIMENSION));
            const cropHeight = Math.round(Math.min(cropBox.height, MAX_CANVAS_DIMENSION));

            // Create cropped image from original
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) throw new Error("Could not create temporary canvas");

            // Apply rotation if any
            if (cropRotation !== 0) {
                tempCtx.translate(cropWidth / 2, cropHeight / 2);
                tempCtx.rotate((cropRotation * Math.PI) / 180);
                tempCtx.translate(-cropWidth / 2, -cropHeight / 2);
            }

            // Draw cropped portion
            tempCtx.drawImage(
                originalImageRef.current,
                cropBox.x, cropBox.y, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );

            // Create new image with object URL
            const blob = await new Promise<Blob>((resolve) => {
                tempCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
            });

            const objectUrl = createObjectUrl(blob);
            const croppedImage = new Image();
            await new Promise<void>((resolve, reject) => {
                croppedImage.onload = () => {
                    // Add to history before updating
                    addToHistory(croppedImage, `Crop to ${cropWidth}×${cropHeight}`, objectUrl);
                    originalImageRef.current = croppedImage;
                    resolve();
                };
                croppedImage.onerror = () => reject(new Error("Failed to load cropped image"));
                croppedImage.src = objectUrl;
            });

            // Update state
            setSelectedImage(objectUrl);
            setWidthPixels(cropWidth);
            setHeightPixels(cropHeight);
            setRotation(prev => (prev + cropRotation) % 360);

            toast({
                title: "Image cropped successfully!",
                description: `New size: ${cropWidth}×${cropHeight}`
            });
            setIsCropping(false);
            setCropBox(null);
            setCropRotation(0);

            drawCanvas();
            await updateFileSizeDisplay();
        } catch (error) {
            console.error("Error cropping image:", error);
            toast({
                title: "Error cropping image",
                description: "Please try again",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setCurrentOperation("");
        }
    };

    // Crop mouse events
    const handleCropMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isCropping || !cropBox || !canvasRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const handleSize = 20;
        const corners = {
            nw: { x: cropBox.x, y: cropBox.y },
            ne: { x: cropBox.x + cropBox.width, y: cropBox.y },
            sw: { x: cropBox.x, y: cropBox.y + cropBox.height },
            se: { x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height }
        };

        for (const [corner, pos] of Object.entries(corners)) {
            if (Math.abs(x - pos.x) <= handleSize && Math.abs(y - pos.y) <= handleSize) {
                setActiveHandle(corner as "nw" | "ne" | "sw" | "se");
                setDragStart({ x, y, cropBox });
                return;
            }
        }

        if (x >= cropBox.x && x <= cropBox.x + cropBox.width &&
            y >= cropBox.y && y <= cropBox.y + cropBox.height) {
            setActiveHandle("move");
            setDragStart({ x, y, cropBox });
        }
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isCropping || !cropBox || !dragStart || !canvasRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        if (activeHandle === "move") {
            const newX = Math.max(0, Math.min(dragStart.cropBox.x + dx, canvasRef.current.width - cropBox.width));
            const newY = Math.max(0, Math.min(dragStart.cropBox.y + dy, canvasRef.current.height - cropBox.height));

            setCropBox({
                ...cropBox,
                x: newX,
                y: newY
            });
        } else if (activeHandle) {
            let newCropBox = { ...dragStart.cropBox };

            switch (activeHandle) {
                case "nw":
                    newCropBox.x += dx;
                    newCropBox.y += dy;
                    newCropBox.width -= dx;
                    newCropBox.height -= dy;
                    break;
                case "ne":
                    newCropBox.y += dy;
                    newCropBox.width += dx;
                    newCropBox.height -= dy;
                    break;
                case "sw":
                    newCropBox.x += dx;
                    newCropBox.width -= dx;
                    newCropBox.height += dy;
                    break;
                case "se":
                    newCropBox.width += dx;
                    newCropBox.height += dy;
                    break;
            }

            if (aspectRatio !== "Free" && aspectRatio !== "Original") {
                const [wRatio, hRatio] = aspectRatio.split(":").map(Number);
                const targetRatio = wRatio / hRatio;

                switch (activeHandle) {
                    case "nw":
                    case "ne":
                    case "sw":
                    case "se":
                        newCropBox.height = newCropBox.width / targetRatio;
                        break;
                }
            }

            newCropBox.x = Math.max(0, newCropBox.x);
            newCropBox.y = Math.max(0, newCropBox.y);
            newCropBox.width = Math.max(50, Math.min(newCropBox.width, canvasRef.current.width - newCropBox.x));
            newCropBox.height = Math.max(50, Math.min(newCropBox.height, canvasRef.current.height - newCropBox.y));

            setCropBox(newCropBox);
        }
    };

    const handleCropMouseUp = () => {
        setDragStart(null);
        setActiveHandle(null);
    };

    // Reset functionality
    const resetAdjustments = () => {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setBlur(0);
        setHue(0);
        setLayerOpacity(100);
        toast({ title: "Adjustments reset!" });
        drawCanvas();
    };

    // Zoom and pan functionality
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev * 1.2, 5));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev / 1.2, 0.1));
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!isCropping) return;

        e.preventDefault();
        const delta = -e.deltaY / 100;
        setZoomLevel(prev => Math.max(0.1, Math.min(5, prev * (1 + delta * 0.1))));
    };

    const handleCropRotation = (angle: number) => {
        setCropRotation(angle);
        drawCanvas();
    };

    // Download functionality
    const handleDownload = async () => {
        if (!canvasRef.current) return;

        setIsLoading(true);
        setCurrentOperation("Preparing download...");

        try {
            if (downloadFormat === "pdf") {
                const { jsPDF } = await import('jspdf');

                const canvas = canvasRef.current;
                const imgData = canvas.toDataURL('image/jpeg', 0.92);

                const pdfWidth = 210;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                const pdf = new jsPDF({
                    orientation: pdfHeight > 297 ? 'portrait' : 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('edited-image.pdf');

                toast({
                    title: "PDF downloaded successfully",
                    description: "High resolution, single page PDF created"
                });
            } else {
                let mimeType: string;
                let quality: number | undefined;
                let extension: string;

                switch (downloadFormat) {
                    case "jpeg":
                        mimeType = 'image/jpeg';
                        quality = 0.92;
                        extension = 'jpg';
                        break;
                    case "jpg":
                        mimeType = 'image/jpeg';
                        quality = 0.95;
                        extension = 'jpg';
                        break;
                    case "png":
                        mimeType = 'image/png';
                        extension = 'png';
                        break;
                    case "webp":
                        mimeType = 'image/webp';
                        quality = 0.95;
                        extension = 'webp';
                        break;
                    case "bmp":
                        mimeType = 'image/bmp';
                        extension = 'bmp';
                        break;
                    default:
                        mimeType = 'image/jpeg';
                        extension = 'jpg';
                }

                const dataURL = canvasRef.current.toDataURL(mimeType, quality);
                const a = document.createElement("a");
                a.href = dataURL;
                a.download = `edited-image.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                let qualityMessage = "";
                if (downloadFormat === "jpeg") {
                    qualityMessage = " - 92% quality (Good balance)";
                } else if (downloadFormat === "jpg") {
                    qualityMessage = " - 95% quality (High quality)";
                }

                toast({
                    title: `Image downloaded as ${downloadFormat.toUpperCase()}${qualityMessage}`
                });
            }

            setDownloadModalOpen(false);
        } catch (error) {
            console.error("Error downloading image:", error);
            toast({
                title: "Error downloading file",
                variant: "destructive",
                description: "Please try again"
            });
        } finally {
            setIsLoading(false);
            setCurrentOperation("");
        }
    };

    // Enhanced resize handlers
    const handleWidthChange = useCallback((newWidth: number) => {
        setWidthPixels(newWidth);
        if (maintainAspectRatio && originalImageRef.current) {
            const ratio = originalImageRef.current.height / originalImageRef.current.width;
            setHeightPixels(Math.round(newWidth * ratio));
        }
    }, [maintainAspectRatio]);

    const handleHeightChange = useCallback((newHeight: number) => {
        setHeightPixels(newHeight);
        if (maintainAspectRatio && originalImageRef.current) {
            const ratio = originalImageRef.current.width / originalImageRef.current.height;
            setWidthPixels(Math.round(newHeight * ratio));
        }
    }, [maintainAspectRatio]);

    const handleWidthPercentageChange = useCallback((newPercentage: number) => {
        setWidthPercentage(newPercentage);
        if (maintainAspectRatio) {
            setHeightPercentage(newPercentage);
        }
    }, [maintainAspectRatio]);

    const handleHeightPercentageChange = useCallback((newPercentage: number) => {
        setHeightPercentage(newPercentage);
        if (maintainAspectRatio) {
            setWidthPercentage(newPercentage);
        }
    }, [maintainAspectRatio]);

    const applyPreset = useCallback((presetName: string) => {
        for (const category of PRESET_DIMENSIONS) {
            const preset = category.dimensions.find(d => d.name === presetName);
            if (preset) {
                setWidthPixels(preset.width);
                setHeightPixels(preset.height);
                setSelectedPreset(presetName);
                toast({
                    title: `Applied preset: ${presetName}`,
                    description: `${preset.width} × ${preset.height} pixels`
                });
                return;
            }
        }
    }, [toast]);

    // Enhanced resize with proper cleanup
    const handleResize = async () => {
        if (!canvasRef.current || !originalImageRef.current) return;

        let newWidth: number, newHeight: number;

        if (resizeMode === "pixels") {
            newWidth = Math.max(1, Math.min(widthPixels, MAX_CANVAS_DIMENSION));
            newHeight = Math.max(1, Math.min(heightPixels, MAX_CANVAS_DIMENSION));
        } else if (resizeMode === "percentage") {
            const currentWidth = originalImageRef.current.width;
            const currentHeight = originalImageRef.current.height;
            newWidth = Math.max(1, Math.min(Math.round(currentWidth * (widthPercentage / 100)), MAX_CANVAS_DIMENSION));
            newHeight = Math.max(1, Math.min(Math.round(currentHeight * (heightPercentage / 100)), MAX_CANVAS_DIMENSION));
        } else {
            newWidth = widthPixels;
            newHeight = heightPixels;
        }

        if (!validateDimensions(newWidth, newHeight)) return;

        setIsLoading(true);
        setCurrentOperation("Resizing image...");

        try {
            // Create new image with resized dimensions
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) throw new Error("Could not create temporary canvas");

            // Draw original image with high quality scaling
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(originalImageRef.current, 0, 0, newWidth, newHeight);

            // Create new image with object URL
            const blob = await new Promise<Blob>((resolve) => {
                tempCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
            });

            const objectUrl = createObjectUrl(blob);
            const resizedImage = new Image();
            await new Promise<void>((resolve, reject) => {
                resizedImage.onload = () => {
                    // Add to history before updating
                    addToHistory(resizedImage, `Resize to ${newWidth}×${newHeight}`, objectUrl);
                    originalImageRef.current = resizedImage;
                    resolve();
                };
                resizedImage.onerror = () => reject(new Error("Failed to load resized image"));
                resizedImage.src = objectUrl;
            });

            // Update state and redraw
            setSelectedImage(objectUrl);
            setWidthPixels(newWidth);
            setHeightPixels(newHeight);

            drawCanvas();
            await updateFileSizeDisplay();

            toast({
                title: `Image resized to ${newWidth}×${newHeight}`,
                description: `Estimated size: ${formatFileSize(await getCurrentFileSize("jpeg"))}`
            });
        } catch (error) {
            console.error("Error resizing image:", error);
            toast({
                title: "Error resizing image",
                description: "Please try again",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
            setCurrentOperation("");
        }
    };

    // Enhanced keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            } else if (e.key === 'Escape') {
                if (isCropping) {
                    setIsCropping(false);
                    setCropBox(null);
                    setCropRotation(0);
                } else if (activeTextOverlay) {
                    setActiveTextOverlay(null);
                }
            } else if (e.key === 'Delete' && activeTextOverlay) {
                removeTextOverlay(activeTextOverlay);
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedImage) {
                e.preventDefault();
                setDownloadModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, isCropping, activeTextOverlay, removeTextOverlay, selectedImage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            cleanupAll();
        };
    }, [cleanupAll]);

    // Canvas updates
    useEffect(() => {
        if (selectedImage && originalImageRef.current) {
            drawCanvas();
            const timer = setTimeout(updateFileSizeDisplay, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedImage, drawCanvas, updateFileSizeDisplay]);

    // Reset everything
    const handleReset = () => {
        if (selectedImage && selectedImage.startsWith('blob:')) {
            revokeObjectUrl(selectedImage);
        }
        cleanupAll();
        setSelectedImage(null);
        setTextOverlays([]);
        setActiveTextOverlay(null);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        setIsCropping(false);
        setCropBox(null);
        setHistory([]);
        setHistoryIndex(-1);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        toast({ title: "Ready for new image!" });
    };

    return (
        <ImageEditorErrorBoundary>
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-4 flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">Professional Image Editor</h1>
                    <p className="text-lg text-muted-foreground">Enterprise-grade image editing with full history support</p>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="mt-2 text-sm text-gray-600">{currentOperation || "Processing..."}</p>
                            </div>
                        </div>
                    )}

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Image Editor</CardTitle>
                            <CardDescription>
                                Upload an image and start editing. Supports JPG, PNG, WebP, BMP formats.
                                {isCalculatingSize && " Calculating file size..."}
                            </CardDescription>
                        </CardHeader>

                        {/* Responsive Layout */}
                        <div className="flex flex-col lg:flex-row gap-4 p-4">
                            {/* Sidebar */}
                            <div className="w-full lg:w-24 flex lg:flex-col gap-2 order-2 lg:order-1">
                                <Button
                                    title="Adjustments"
                                    variant={activeTool === "adjustments" ? "default" : "outline"}
                                    onClick={() => setActiveTool("adjustments")}
                                    aria-label="Adjustments tool"
                                >
                                    <Sparkles size={20}/>
                                </Button>
                                <Button
                                    title="Crop"
                                    variant={activeTool === "transform" ? "default" : "outline"}
                                    onClick={() => {
                                        setActiveTool("transform");
                                        setIsCropping(true);
                                        initCropBox();
                                    }}
                                    disabled={!selectedImage || isLoading}
                                    aria-label="Crop tool"
                                >
                                    <Crop size={20}/>
                                </Button>
                                <Button
                                    title="Text"
                                    variant={activeTool === "text" ? "default" : "outline"}
                                    onClick={() => setActiveTool("text")}
                                    disabled={!selectedImage || isLoading}
                                    aria-label="Text tool"
                                >
                                    <Type size={20}/>
                                </Button>
                                <Button
                                    title="Resize"
                                    variant={activeTool === "resize" ? "default" : "outline"}
                                    onClick={() => setActiveTool("resize")}
                                    disabled={!selectedImage || isLoading}
                                    aria-label="Resize tool"
                                >
                                    <Maximize2 size={20}/>
                                </Button>
                            </div>

                            {/* Canvas Container */}
                            <div className="flex-1 flex flex-col order-1 lg:order-2">
                                {/* Top Bar */}
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleUndo}
                                            disabled={!selectedImage || historyIndex <= 0}
                                            size="sm"
                                            variant="outline"
                                            title="Undo (Ctrl+Z)"
                                        >
                                            <Undo size={16} />
                                        </Button>
                                        <Button
                                            onClick={handleRedo}
                                            disabled={!selectedImage || historyIndex >= history.length - 1}
                                            size="sm"
                                            variant="outline"
                                            title="Redo (Ctrl+Y)"
                                        >
                                            <Redo size={16} />
                                        </Button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleZoomOut}
                                            disabled={!selectedImage || zoomLevel <= 0.1}
                                            size="sm"
                                            variant="outline"
                                        >
                                            <ZoomOut size={16} />
                                        </Button>
                                        <Button
                                            onClick={handleResetZoom}
                                            disabled={!selectedImage || zoomLevel === 1}
                                            size="sm"
                                            variant="outline"
                                        >
                                            {Math.round(zoomLevel * 100)}%
                                        </Button>
                                        <Button
                                            onClick={handleZoomIn}
                                            disabled={!selectedImage || zoomLevel >= 5}
                                            size="sm"
                                            variant="outline"
                                        >
                                            <ZoomIn size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Canvas Area */}
                                <div
                                    ref={containerRef}
                                    className="flex-1 flex justify-center items-center bg-gray-100 rounded-lg relative min-h-[400px] max-h-[600px] lg:max-h-none overflow-auto"
                                    onWheel={handleWheel}
                                    style={{
                                        cursor: isTextDragging ? 'grabbing' :
                                            isCropping ? (activeHandle ? 'grabbing' : dragStart ? 'grabbing' : 'grab') : 'default'
                                    }}
                                    onMouseMove={isTextDragging ? handleTextMouseMove : undefined}
                                    onMouseUp={isTextDragging ? handleTextMouseUp : undefined}
                                    onMouseLeave={isTextDragging ? handleTextMouseUp : undefined}
                                    onTouchMove={isTextDragging ? handleTextTouchMove : undefined}
                                    onTouchEnd={isTextDragging ? handleTextTouchEnd : undefined}
                                >
                                    {!selectedImage && (
                                        <div
                                            className="flex flex-col justify-center items-center cursor-pointer p-10 border-2 border-dashed rounded-lg w-full h-full"
                                            onClick={() => fileInputRef.current?.click()}
                                            role="button"
                                            aria-label="Upload image area"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                        >
                                            <ImagePlus className="h-12 w-12 mb-2 text-gray-400"/>
                                            <p className="text-gray-600">Click to upload image</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Supports JPG, PNG, WebP, BMP (Max {formatFileSize(MAX_FILE_SIZE)})
                                            </p>
                                        </div>
                                    )}
                                    {selectedImage && (
                                        <div
                                            className="overflow-auto max-w-full max-h-full"
                                            style={{
                                                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                                                transformOrigin: '0 0'
                                            }}
                                        >
                                            <canvas
                                                ref={canvasRef}
                                                className="block border rounded-lg shadow-md max-w-full max-h-full"
                                                onMouseDown={(e) => {
                                                    if (isCropping) {
                                                        handleCropMouseDown(e);
                                                    } else {
                                                        // Text selection
                                                        const coords = getCanvasCoordinates(e.clientX, e.clientY);
                                                        const clickedOverlay = textOverlays.find(overlay => {
                                                            if (!overlay.isVisible) return false;

                                                            const ctx = canvasRef.current?.getContext('2d');
                                                            if (!ctx) return false;

                                                            ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
                                                            const metrics = ctx.measureText(overlay.text);

                                                            let x = overlay.x;
                                                            if (overlay.textAlign === "center") {
                                                                x = overlay.x - metrics.width / 2;
                                                            } else if (overlay.textAlign === "right") {
                                                                x = overlay.x - metrics.width;
                                                            }

                                                            return coords.x >= x - 5 &&
                                                                coords.x <= x + metrics.width + 5 &&
                                                                coords.y >= overlay.y - 5 &&
                                                                coords.y <= overlay.y + overlay.fontSize + 5;
                                                        });

                                                        if (clickedOverlay) {
                                                            handleTextMouseDown(e, clickedOverlay);
                                                        } else {
                                                            setActiveTextOverlay(null);
                                                        }
                                                    }
                                                }}
                                                onTouchStart={(e) => {
                                                    if (isCropping) {
                                                        // Handle crop touch
                                                    } else {
                                                        const touch = e.touches[0];
                                                        const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
                                                        const touchedOverlay = textOverlays.find(overlay => {
                                                            // Similar hit detection as mouse
                                                            const ctx = canvasRef.current?.getContext('2d');
                                                            if (!ctx) return false;

                                                            ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
                                                            const metrics = ctx.measureText(overlay.text);

                                                            let x = overlay.x;
                                                            if (overlay.textAlign === "center") {
                                                                x = overlay.x - metrics.width / 2;
                                                            } else if (overlay.textAlign === "right") {
                                                                x = overlay.x - metrics.width;
                                                            }

                                                            return coords.x >= x - 5 &&
                                                                coords.x <= x + metrics.width + 5 &&
                                                                coords.y >= overlay.y - 5 &&
                                                                coords.y <= overlay.y + overlay.fontSize + 5;
                                                        });

                                                        if (touchedOverlay) {
                                                            handleTextTouchStart(e, touchedOverlay);
                                                        } else {
                                                            setActiveTextOverlay(null);
                                                        }
                                                    }
                                                }}
                                                onMouseMove={isCropping ? handleCropMouseMove : undefined}
                                                onMouseUp={isCropping ? handleCropMouseUp : undefined}
                                                onMouseLeave={isCropping ? handleCropMouseUp : undefined}
                                                aria-label="Image editing canvas"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        aria-label="Image file input"
                                    />
                                </div>
                            </div>

                            {/* Tool Panel */}
                            <div className="w-full lg:w-96 space-y-4 order-3">
                                <Tabs value={activeTool} onValueChange={setActiveTool}>
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="adjustments">Adjust</TabsTrigger>
                                        <TabsTrigger value="transform">Crop</TabsTrigger>
                                        <TabsTrigger value="text">Text</TabsTrigger>
                                        <TabsTrigger value="resize">Resize</TabsTrigger>
                                    </TabsList>

                                    {/* Text Tab */}
                                    <TabsContent value="text" className="space-y-4">
                                        <TextToolPanel
                                            textOverlays={textOverlays}
                                            activeTextOverlay={activeTextOverlay}
                                            onUpdateText={updateTextOverlay}
                                            onAddText={handleAddText}
                                            onRemoveText={removeTextOverlay}
                                            onRemoveAllText={removeAllText}
                                            onSetActiveText={setActiveTextOverlay}
                                            fontSize={fontSize}
                                            setFontSize={setFontSize}
                                            fontFamily={fontFamily}
                                            setFontFamily={setFontFamily}
                                            textColor={textColor}
                                            setTextColor={setTextColor}
                                        />

                                        {/* Drag Instructions */}
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm text-blue-800">
                                                <Move className="h-4 w-4" />
                                                <span>Click and drag text to reposition</span>
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                Use Delete key to remove selected text
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Adjustments Tab */}
                                    <TabsContent value="adjustments" className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium">Brightness</label>
                                                    <span className="text-sm text-gray-500">{brightness}%</span>
                                                </div>
                                                <Slider
                                                    value={[brightness]}
                                                    onValueChange={([value]) => setBrightness(value)}
                                                    min={0}
                                                    max={200}
                                                    step={1}
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium">Contrast</label>
                                                    <span className="text-sm text-gray-500">{contrast}%</span>
                                                </div>
                                                <Slider
                                                    value={[contrast]}
                                                    onValueChange={([value]) => setContrast(value)}
                                                    min={0}
                                                    max={200}
                                                    step={1}
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium">Saturation</label>
                                                    <span className="text-sm text-gray-500">{saturation}%</span>
                                                </div>
                                                <Slider
                                                    value={[saturation]}
                                                    onValueChange={([value]) => setSaturation(value)}
                                                    min={0}
                                                    max={200}
                                                    step={1}
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium">Blur</label>
                                                    <span className="text-sm text-gray-500">{blur}px</span>
                                                </div>
                                                <Slider
                                                    value={[blur]}
                                                    onValueChange={([value]) => setBlur(value)}
                                                    min={0}
                                                    max={20}
                                                    step={0.1}
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium">Hue</label>
                                                    <span className="text-sm text-gray-500">{hue}°</span>
                                                </div>
                                                <Slider
                                                    value={[hue]}
                                                    onValueChange={([value]) => setHue(value)}
                                                    min={-180}
                                                    max={180}
                                                    step={1}
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium">Opacity</label>
                                                    <span className="text-sm text-gray-500">{layerOpacity}%</span>
                                                </div>
                                                <Slider
                                                    value={[layerOpacity]}
                                                    onValueChange={([value]) => setLayerOpacity(value)}
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                />
                                            </div>

                                            <Button onClick={resetAdjustments} variant="outline" className="w-full">
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset Adjustments
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* Transform Tab */}
                                    <TabsContent value="transform" className="space-y-4">
                                        <div className="space-y-4">
                                            {isCropping && (
                                                <>
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
                                                        <Select value={aspectRatio} onValueChange={(value: AspectRatio) => {
                                                            setAspectRatio(value);
                                                            initCropBox();
                                                        }}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Free">Free</SelectItem>
                                                                <SelectItem value="Original">Original</SelectItem>
                                                                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                                                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                                                                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                                                                <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                                                                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Grid Overlay</label>
                                                        <Select value={activeGrid} onValueChange={(value: GridType) => setActiveGrid(value)}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">None</SelectItem>
                                                                <SelectItem value="ruleOfThirds">Rule of Thirds</SelectItem>
                                                                <SelectItem value="grid">Grid</SelectItem>
                                                                <SelectItem value="diagonal">Diagonal</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-sm font-medium">Crop Rotation</label>
                                                            <span className="text-sm text-gray-500">{cropRotation}°</span>
                                                        </div>
                                                        <Slider
                                                            value={[cropRotation]}
                                                            onValueChange={([value]) => handleCropRotation(value)}
                                                            min={-45}
                                                            max={45}
                                                            step={1}
                                                        />
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button onClick={confirmCrop} className="flex-1" disabled={isLoading}>
                                                            Apply Crop
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setIsCropping(false);
                                                                setCropBox(null);
                                                                setCropRotation(0);
                                                            }}
                                                            variant="outline"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>

                                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <div className="text-sm text-yellow-800">
                                                            <strong>Tip:</strong> Drag the corners to resize, or drag inside to move the crop area.
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {!isCropping && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Crop className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    <p>Click the crop button to start cropping</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Resize Tab */}
                                    <TabsContent value="resize" className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Resize Mode</label>
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
                                                <>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-sm font-medium">Width (px)</label>
                                                            <Input
                                                                type="number"
                                                                value={widthPixels}
                                                                onChange={(e) => handleWidthChange(Number(e.target.value))}
                                                                min={1}
                                                                max={MAX_CANVAS_DIMENSION}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium">Height (px)</label>
                                                            <Input
                                                                type="number"
                                                                value={heightPixels}
                                                                onChange={(e) => handleHeightChange(Number(e.target.value))}
                                                                min={1}
                                                                max={MAX_CANVAS_DIMENSION}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant={maintainAspectRatio ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                                                        >
                                                            {maintainAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                                        </Button>
                                                        <span className="text-sm">Maintain aspect ratio</span>
                                                    </div>
                                                </>
                                            )}

                                            {resizeMode === "percentage" && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-sm font-medium">Width (%)</label>
                                                        <Input
                                                            type="number"
                                                            value={widthPercentage}
                                                            onChange={(e) => handleWidthPercentageChange(Number(e.target.value))}
                                                            min={1}
                                                            max={1000}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Height (%)</label>
                                                        <Input
                                                            type="number"
                                                            value={heightPercentage}
                                                            onChange={(e) => handleHeightPercentageChange(Number(e.target.value))}
                                                            min={1}
                                                            max={1000}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {resizeMode === "preset" && (
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Select Preset</label>
                                                    <Select value={selectedPreset} onValueChange={applyPreset}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose a preset" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PRESET_DIMENSIONS.map(category => (
                                                                <div key={category.name}>
                                                                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                        {category.name}
                                                                    </div>
                                                                    {category.dimensions.map(preset => (
                                                                        <SelectItem key={preset.name} value={preset.name}>
                                                                            {preset.name} ({preset.width}×{preset.height})
                                                                        </SelectItem>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <Button onClick={handleResize} disabled={isLoading} className="w-full">
                                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Apply Resize
                                            </Button>

                                            {/* File size information */}
                                            {originalFileSize > 0 && (
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-sm text-gray-600">
                                                        <div>Original: {formatFileSize(originalFileSize)}</div>
                                                        {currentCanvasSize > 0 && (
                                                            <div>Current: {formatFileSize(currentCanvasSize)}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2 justify-center px-4 pb-4">
                            <Button
                                onClick={handleReset}
                                disabled={isLoading}
                                variant="outline"
                            >
                                Change Image
                            </Button>
                            <Button
                                onClick={() => setDownloadModalOpen(true)}
                                disabled={isLoading || !selectedImage}
                            >
                                <Download size={16} className="mr-2"/> Download
                            </Button>
                        </div>
                    </Card>

                    {/* Download Modal */}
                    {downloadModalOpen && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                            <div className="bg-white p-6 rounded-lg w-80">
                                <h2 className="text-xl font-bold mb-4">Select Download Format</h2>
                                <Select
                                    value={downloadFormat}
                                    onValueChange={(val) => setDownloadFormat(val as DownloadFormat)}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="png">
                                            <div className="flex flex-col">
                                                <span>PNG</span>
                                                <span className="text-xs text-gray-500">Lossless quality, transparency</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="jpeg">
                                            <div className="flex flex-col">
                                                <span>JPEG</span>
                                                <span className="text-xs text-gray-500">92% quality - Good balance</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="jpg">
                                            <div className="flex flex-col">
                                                <span>JPG (High Quality)</span>
                                                <span className="text-xs text-gray-500">95% quality - Best quality</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="webp">
                                            <div className="flex flex-col">
                                                <span>WebP</span>
                                                <span className="text-xs text-gray-500">Modern format, good compression</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="bmp">
                                            <div className="flex flex-col">
                                                <span>BMP</span>
                                                <span className="text-xs text-gray-500">Uncompressed, maximum quality</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="pdf">
                                            <div className="flex flex-col">
                                                <span>PDF</span>
                                                <span className="text-xs text-gray-500">Single page, high resolution</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        className="flex-1"
                                        onClick={handleDownload}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Download
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant="outline"
                                        onClick={() => setDownloadModalOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ImageEditorErrorBoundary>
    );
};

export default ImageTools;