"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    FolderOpen,
    Upload,
    Download,
    FileImage,
    FileVideo,
    FileText,
    File,
    X,
    Loader2,
    CheckCircle
} from "lucide-react";

interface ConvertedFile {
    originalName: string;
    convertedName: string;
    originalFormat: string;
    targetFormat: string;
    url: string;
    size: string;
}

interface FileCategory {
    name: string;
    icon: React.ElementType;
    formats: string[];
    description: string;
}

const fileCategories: FileCategory[] = [
    {
        name: "Images",
        icon: FileImage,
        formats: ["PNG", "JPG", "JPEG", "WEBP", "BMP", "GIF", "TIFF"],
        description: "Convert between image formats"
    },
    {
        name: "Videos",
        icon: FileVideo,
        formats: ["MP4", "AVI", "MOV", "WEBM", "MKV", "FLV"],
        description: "Convert between video formats"
    },
    {
        name: "Documents",
        icon: FileText,
        formats: ["PDF", "DOCX", "TXT", "HTML", "RTF"],
        description: "Convert between document formats"
    },
    {
        name: "Archives",
        icon: File,
        formats: ["ZIP", "RAR", "7Z", "TAR", "GZ"],
        description: "Convert between archive formats"
    }
];

export default function FileConverter() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<FileCategory>(fileCategories[0]);
    const [targetFormat, setTargetFormat] = useState<string>("");
    const [isConverting, setIsConverting] = useState(false);
    const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
    const [conversionProgress, setConversionProgress] = useState(0);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileCategory = (fileName: string): FileCategory => {
        const extension = fileName.split('.').pop()?.toUpperCase();
        if (!extension) return fileCategories[2]; // Default to Documents

        for (const category of fileCategories) {
            if (category.formats.includes(extension)) {
                return category;
            }
        }
        return fileCategories[2]; // Default to Documents
    };

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const category = getFileCategory(file.name);
            return category.formats.includes(file.name.split('.').pop()?.toUpperCase() || '');
        });

        if (validFiles.length !== files.length) {
            toast({
                title: "Some files skipped",
                description: "Only supported file formats can be converted",
                variant: "destructive",
            });
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
        
        // Auto-select category based on first file
        if (validFiles.length > 0 && !targetFormat) {
            const category = getFileCategory(validFiles[0].name);
            setSelectedCategory(category);
            setTargetFormat(category.formats[0]);
        }
    }, [toast, targetFormat]);

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const convertFiles = async () => {
        if (selectedFiles.length === 0) {
            toast({
                title: "No files selected",
                description: "Please select files to convert",
                variant: "destructive",
            });
            return;
        }

        if (!targetFormat) {
            toast({
                title: "No target format",
                description: "Please select a target format",
                variant: "destructive",
            });
            return;
        }

        setIsConverting(true);
        setConversionProgress(0);

        try {
            const newConvertedFiles: ConvertedFile[] = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                setConversionProgress((i / selectedFiles.length) * 100);

                // Simulate conversion process
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Create a mock converted file (in real app, this would be actual conversion)
                const convertedFile: ConvertedFile = {
                    originalName: file.name,
                    convertedName: file.name.replace(/\.[^/.]+$/, `.${targetFormat.toLowerCase()}`),
                    originalFormat: file.name.split('.').pop()?.toUpperCase() || "",
                    targetFormat: targetFormat,
                    url: URL.createObjectURL(file), // In real app, this would be the converted file
                    size: formatFileSize(file.size)
                };

                newConvertedFiles.push(convertedFile);
            }

            setConversionProgress(100);
            setConvertedFiles(prev => [...prev, ...newConvertedFiles]);
            setSelectedFiles([]);
            
            toast({
                title: "Conversion successful",
                description: `Successfully converted ${selectedFiles.length} file(s) to ${targetFormat}`,
            });

        } catch (error) {
            console.error('Conversion error:', error);
            toast({
                title: "Conversion failed",
                description: "An error occurred during file conversion",
                variant: "destructive",
            });
        } finally {
            setIsConverting(false);
            setConversionProgress(0);
        }
    };

    const downloadFile = (convertedFile: ConvertedFile) => {
        const a = document.createElement('a');
        a.href = convertedFile.url;
        a.download = convertedFile.convertedName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
            title: "Download started",
            description: `Downloading ${convertedFile.convertedName}`,
        });
    };

    const downloadAllFiles = () => {
        convertedFiles.forEach(file => {
            setTimeout(() => downloadFile(file), 100);
        });
    };

    const clearAll = () => {
        setSelectedFiles([]);
        setConvertedFiles([]);
        setTargetFormat("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCategoryChange = (category: FileCategory) => {
        setSelectedCategory(category);
        setTargetFormat(category.formats[0]);
    };

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">File Converter</h1>
                    <p className="text-xl text-muted-foreground">
                        Convert files between different formats seamlessly
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Converter */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Category Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Select File Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {fileCategories.map((category) => {
                                        const Icon = category.icon;
                                        return (
                                            <Button
                                                key={category.name}
                                                variant={selectedCategory.name === category.name ? "default" : "outline"}
                                                className="h-20 flex-col"
                                                onClick={() => handleCategoryChange(category)}
                                            >
                                                <Icon className="h-6 w-6 mb-2" />
                                                <span className="text-sm">{category.name}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-muted-foreground mt-4">
                                    {selectedCategory.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* File Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Files</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Drop files here or click to browse
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Supported formats: {selectedCategory.formats.join(", ")}
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept={selectedCategory.formats.map(f => `.${f.toLowerCase()}`).join(",")}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Button onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Files
                                    </Button>
                                </div>

                                {/* Selected Files */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                                    <div className="flex items-center space-x-2">
                                                        <File className="h-4 w-4" />
                                                        <span className="text-sm truncate">{file.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({formatFileSize(file.size)})
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Conversion Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversion Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Target Format</label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                                        {selectedCategory.formats.map((format) => (
                                            <Button
                                                key={format}
                                                variant={targetFormat === format ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setTargetFormat(format)}
                                            >
                                                {format}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {isConverting && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Converting...</span>
                                            <span>{Math.round(conversionProgress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${conversionProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={convertFiles}
                                        disabled={isConverting || selectedFiles.length === 0 || !targetFormat}
                                        className="flex-1"
                                    >
                                        {isConverting ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <FolderOpen className="h-4 w-4 mr-2" />
                                        )}
                                        Convert Files
                                    </Button>
                                    <Button variant="outline" onClick={clearAll}>
                                        Clear All
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Converted Files Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Converted Files
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {convertedFiles.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {convertedFiles.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <File className="h-8 w-8 mx-auto mb-2" />
                                        <p>No converted files yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {convertedFiles.map((file, index) => (
                                            <div key={index} className="p-3 border rounded-lg space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => downloadFile(file)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-medium truncate">{file.convertedName}</p>
                                                    <p className="text-muted-foreground text-xs">
                                                        {file.originalFormat} → {file.targetFormat} • {file.size}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {convertedFiles.length > 1 && (
                                            <Button
                                                variant="outline"
                                                className="w-full mt-4"
                                                onClick={downloadAllFiles}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download All
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}