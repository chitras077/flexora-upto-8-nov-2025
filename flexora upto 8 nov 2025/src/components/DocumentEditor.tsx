"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Download,
    Upload,
    Eye,
    Type,
    Palette
} from "lucide-react";

interface DocumentStyle {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    textAlign: string;
    color: string;
}

export default function DocumentEditor() {
    const { toast } = useToast();
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState("");
    const [title, setTitle] = useState("Untitled Document");
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [documentStyle, setDocumentStyle] = useState<DocumentStyle>({
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "left",
        color: "#000000"
    });

    const fontFamilies = [
        "Arial", "Times New Roman", "Helvetica", "Georgia", 
        "Verdana", "Courier New", "Comic Sans MS", "Impact"
    ];

    const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

    useEffect(() => {
        if (editorRef.current && !isPreviewMode) {
            editorRef.current.innerHTML = content;
        }
    }, [content, isPreviewMode]);

    const handleStyleChange = (style: Partial<DocumentStyle>) => {
        setDocumentStyle(prev => ({ ...prev, ...style }));
        applyStyleToSelection(style);
    };

    const applyStyleToSelection = (style: Partial<DocumentStyle>) => {
        if (!editorRef.current) return;
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            
            if (selectedText) {
                if (style.fontWeight === "bold") {
                    document.execCommand('bold', false);
                } else if (style.fontStyle === "italic") {
                    document.execCommand('italic', false);
                } else if (style.textDecoration === "underline") {
                    document.execCommand('underline', false);
                } else if (style.textAlign) {
                    document.execCommand(`justify${style.textAlign}`, false);
                } else if (style.color) {
                    document.execCommand('foreColor', false, style.color);
                } else if (style.fontSize) {
                    document.execCommand('fontSize', false, '7');
                    const fontElements = editorRef.current.getElementsByTagName('font');
                    for (let i = 0; i < fontElements.length; i++) {
                        if (fontElements[i].size === '7') {
                            fontElements[i].removeAttribute('size');
                            fontElements[i].style.fontSize = style.fontSize + 'px';
                        }
                    }
                }
            }
        }
    };

    const insertList = (ordered: boolean = false) => {
        document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setContent(text);
                setTitle(file.name.replace('.txt', ''));
                toast({
                    title: "File loaded successfully",
                    description: file.name,
                });
            };
            reader.readAsText(file);
        } else {
            toast({
                title: "Invalid file type",
                description: "Please upload a text file (.txt)",
                variant: "destructive",
            });
        }
    };

    const downloadDocument = (format: 'txt' | 'html' | 'pdf') => {
        let content = "";
        let fileName = "";
        let mimeType = "";

        switch (format) {
            case 'txt':
                content = editorRef.current?.innerText || "";
                fileName = `${title}.txt`;
                mimeType = "text/plain";
                break;
            case 'html':
                content = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { font-family: ${documentStyle.fontFamily}; font-size: ${documentStyle.fontSize}px; color: ${documentStyle.color}; }
                        </style>
                    </head>
                    <body>
                        ${editorRef.current?.innerHTML || ""}
                    </body>
                    </html>
                `;
                fileName = `${title}.html`;
                mimeType = "text/html";
                break;
            case 'pdf':
                // In a real app, you would use a PDF library like jsPDF
                toast({
                    title: "PDF export",
                    description: "PDF export would require additional library integration",
                });
                return;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Document downloaded",
            description: fileName,
        });
    };

    const clearDocument = () => {
        setContent("");
        setTitle("Untitled Document");
        if (editorRef.current) {
            editorRef.current.innerHTML = "";
        }
        toast({
            title: "Document cleared",
        });
    };

    const getWordCount = () => {
        const text = editorRef.current?.innerText || "";
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const getCharacterCount = () => {
        return (editorRef.current?.innerText || "").length;
    };

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">Document Editor</h1>
                    <p className="text-xl text-muted-foreground">
                        Create and edit documents with rich formatting options
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Document Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Document title"
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <div>Words: {getWordCount()}</div>
                                    <div>Characters: {getCharacterCount()}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Export Options</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => downloadDocument('txt')}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download as TXT
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => downloadDocument('html')}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download as HTML
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => downloadDocument('pdf')}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download as PDF
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload File
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={clearDocument}
                                >
                                    Clear Document
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Editor */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Editor</CardTitle>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        {isPreviewMode ? "Edit" : "Preview"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!isPreviewMode && (
                                    <div className="border-b pb-4 mb-4 space-y-4">
                                        {/* Formatting Toolbar */}
                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex gap-1 border-r pr-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStyleChange({ fontWeight: "bold" })}
                                                >
                                                    <Bold className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStyleChange({ fontStyle: "italic" })}
                                                >
                                                    <Italic className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStyleChange({ textDecoration: "underline" })}
                                                >
                                                    <Underline className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex gap-1 border-r pr-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStyleChange({ textAlign: "left" })}
                                                >
                                                    <AlignLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStyleChange({ textAlign: "center" })}
                                                >
                                                    <AlignCenter className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStyleChange({ textAlign: "right" })}
                                                >
                                                    <AlignRight className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex gap-1 border-r pr-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => insertList(false)}
                                                >
                                                    <List className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => insertList(true)}
                                                >
                                                    <ListOrdered className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Style Controls */}
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex items-center gap-2">
                                                <Type className="h-4 w-4" />
                                                <Select value={documentStyle.fontFamily} onValueChange={(value) => handleStyleChange({ fontFamily: value })}>
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontFamilies.map((font) => (
                                                            <SelectItem key={font} value={font}>
                                                                {font}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">Size:</span>
                                                <Select value={documentStyle.fontSize.toString()} onValueChange={(value) => handleStyleChange({ fontSize: Number(value) })}>
                                                    <SelectTrigger className="w-16">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontSizes.map((size) => (
                                                            <SelectItem key={size} value={size.toString()}>
                                                                {size}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Palette className="h-4 w-4" />
                                                <input
                                                    type="color"
                                                    value={documentStyle.color}
                                                    onChange={(e) => handleStyleChange({ color: e.target.value })}
                                                    className="w-8 h-8 border rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Editor Area */}
                                <div
                                    ref={editorRef}
                                    contentEditable={!isPreviewMode}
                                    className="min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        fontFamily: documentStyle.fontFamily,
                                        fontSize: `${documentStyle.fontSize}px`,
                                        color: documentStyle.color,
                                        textAlign: documentStyle.textAlign as any,
                                    }}
                                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                    suppressContentEditableWarning={true}
                                >
                                    Start typing your document here...
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}