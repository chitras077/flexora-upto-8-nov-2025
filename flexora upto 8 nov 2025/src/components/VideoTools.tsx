"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
    Video,
    Upload,
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    Download,
    X,
    Scissors,
    Loader2,
    SkipBack,
    SkipForward,
    Settings
} from "lucide-react";

interface VideoFile {
    file: File;
    url: string;
    name: string;
    size: string;
    duration: number;
}

interface TrimRange {
    start: number;
    end: number;
}

export default function VideoTools() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);

    // Trim state
    const [showTrimTool, setShowTrimTool] = useState(false);
    const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 0 });
    const [trimError, setTrimError] = useState('');

    const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4GB

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Validate file type
            const validTypes = [
                '.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v', '.wmv', '.flv', '.3gp',
                'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
                'video/x-matroska', 'video/x-m4v', 'video/x-ms-wmv', 'video/x-flv', 'video/3gpp'
            ];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!validTypes.includes(fileExtension) && !validTypes.includes(file.type)) {
                toast({
                    title: "Invalid file type",
                    description: "Please select a valid video file (MP4, MOV, AVI, WebM, MKV, M4V, WMV, FLV, 3GP)",
                    variant: "destructive",
                });
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: "File too large",
                    description: "Please select a video under 4GB",
                    variant: "destructive",
                });
                return;
            }

            setIsLoading(true);
            const url = URL.createObjectURL(file);

            try {
                const newVideoFile: VideoFile = {
                    file,
                    url,
                    name: file.name,
                    size: formatFileSize(file.size),
                    duration: 0 // Will be set when video loads
                };

                setVideoFile(newVideoFile);
                setCurrentTime(0);
                setIsPlaying(false);
                setPlaybackRate(1);
                setTrimRange({ start: 0, end: 0 });
                setTrimError('');
                setShowTrimTool(false);

            } catch (error) {
                console.error('Error loading video:', error);
                toast({
                    title: "Error loading video",
                    description: "Please try another file",
                    variant: "destructive",
                });
                URL.revokeObjectURL(url);
            } finally {
                setIsLoading(false);
            }
        }
    }, [toast]);

    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(error => {
                    console.error("Error playing video:", error);
                    toast({
                        title: "Playback error",
                        description: "Could not play the video",
                        variant: "destructive",
                    });
                });
            }
        }
    }, [isPlaying, toast]);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            setCurrentTime(current);
        }
    }, []);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (!isNaN(newTime) && videoRef.current) {
            setCurrentTime(newTime);
            videoRef.current.currentTime = newTime;
        }
    };

    const handleLoadedMetadata = useCallback(() => {
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration;
            setDuration(videoDuration);
            setTrimRange({ start: 0, end: videoDuration });
            if (videoFile) {
                setVideoFile(prev => prev ? { ...prev, duration: videoDuration } : null);
            }
        }
    }, [videoFile]);

    const skipForward = useCallback(() => {
        if (videoRef.current) {
            const newTime = Math.min(videoRef.current.currentTime + 10, duration);
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, [duration]);

    const skipBackward = useCallback(() => {
        if (videoRef.current) {
            const newTime = Math.max(videoRef.current.currentTime - 10, 0);
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, []);

    const changePlaybackRate = useCallback((rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (!isNaN(newVolume) && videoRef.current) {
            setVolume(newVolume);
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const handleVideoEnd = useCallback(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    }, []);

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error("Video error:", e);
        toast({
            title: "Video error",
            description: "The file may be corrupted or in an unsupported format",
            variant: "destructive",
        });
        setIsPlaying(false);
        setIsLoading(false);
    };

    const handleTrimRangeChange = (type: 'start' | 'end', value: number) => {
        setTrimRange(prev => {
            const newRange = { ...prev, [type]: value };

            // Validate range
            if (type === 'start' && value > prev.end) {
                newRange.end = value;
                setTrimError('Start time cannot be after end time. Adjusted end time automatically.');
            } else if (type === 'end' && value < prev.start) {
                newRange.start = value;
                setTrimError('End time cannot be before start time. Adjusted start time automatically.');
            } else {
                setTrimError('');
            }

            // Validate minimum duration (0.1 seconds)
            const newDuration = newRange.end - newRange.start;
            if (newDuration < 0.1) {
                setTrimError('Trim duration must be at least 0.1 seconds');
            } else if (trimError && newDuration >= 0.1) {
                setTrimError('');
            }

            // Ensure values are within video duration
            newRange.start = Math.max(0, Math.min(newRange.start, duration));
            newRange.end = Math.max(0, Math.min(newRange.end, duration));

            return newRange;
        });
    };

    const processVideoTrim = async () => {
        if (!videoFile) {
            toast({
                title: "No video selected",
                description: "Please select a video file first",
                variant: "destructive",
            });
            return;
        }

        if (trimRange.end - trimRange.start < 0.1) {
            toast({
                title: "Invalid trim range",
                description: "Trim duration must be at least 0.1 seconds",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        setProcessingProgress(0);

        try {
            // Simulate video processing
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setProcessingProgress(i);
            }

            // Create a download link (in a real app, this would be the processed video)
            const a = document.createElement('a');
            a.href = videoFile.url;
            a.download = `trimmed_${videoFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast({
                title: "Video trimmed successfully",
                description: `Duration: ${formatTime(trimRange.end - trimRange.start)}`,
            });

        } catch (error) {
            console.error('Video processing error:', error);
            toast({
                title: "Processing failed",
                description: "An error occurred while processing the video",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
            setProcessingProgress(0);
        }
    };

    const resetVideo = () => {
        if (videoFile) {
            URL.revokeObjectURL(videoFile.url);
        }
        setVideoFile(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setPlaybackRate(1);
        setShowTrimTool(false);
        setTrimError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Cleanup URLs when component unmounts
    useEffect(() => {
        return () => {
            if (videoFile) {
                URL.revokeObjectURL(videoFile.url);
            }
        };
    }, [videoFile]);

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">Video Processing Tools</h1>
                    <p className="text-xl text-muted-foreground">
                        Trim, edit, and enhance your videos with powerful processing tools
                    </p>
                </div>

                {!videoFile ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="p-12 text-center">
                            <div className="mb-6">
                                <Video className="h-16 w-16 mx-auto text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Upload a Video</h3>
                            <p className="text-muted-foreground mb-6">
                                Select a video file to start editing (Max 4GB)
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleVideoUpload}
                                className="hidden"
                            />
                            <Button onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2" />
                                Choose Video
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Video Player */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="mb-4 flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">Video Player</h3>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setShowTrimTool(!showTrimTool)}>
                                                <Scissors className="h-4 w-4 mr-2" />
                                                Trim
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={resetVideo}>
                                                <X className="h-4 w-4 mr-2" />
                                                Close
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Video Element */}
                                    <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                                        {isLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                                            </div>
                                        )}
                                        <video
                                            ref={videoRef}
                                            src={videoFile.url}
                                            className="w-full h-auto max-h-[400px]"
                                            onTimeUpdate={handleTimeUpdate}
                                            onLoadedMetadata={handleLoadedMetadata}
                                            onEnded={handleVideoEnd}
                                            onError={handleVideoError}
                                        />
                                    </div>

                                    {/* Video Controls */}
                                    <div className="space-y-4">
                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>{formatTime(currentTime)}</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={duration}
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        {/* Control Buttons */}
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="outline" size="sm" onClick={skipBackward}>
                                                <SkipBack className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={togglePlayPause} size="sm">
                                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={skipForward}>
                                                <SkipForward className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Volume and Speed Controls */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 flex-1">
                                                <Button variant="ghost" size="sm" onClick={toggleMute}>
                                                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                                </Button>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={1}
                                                    step={0.1}
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Speed:</span>
                                                <select
                                                    value={playbackRate}
                                                    onChange={(e) => changePlaybackRate(Number(e.target.value))}
                                                    className="text-sm border rounded px-2 py-1"
                                                >
                                                    <option value={0.5}>0.5x</option>
                                                    <option value={0.75}>0.75x</option>
                                                    <option value={1}>1x</option>
                                                    <option value={1.25}>1.25x</option>
                                                    <option value={1.5}>1.5x</option>
                                                    <option value={2}>2x</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trim Tool */}
                            {showTrimTool && (
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Scissors className="h-5 w-5" />
                                            Trim Video
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium">Start Time</label>
                                                <Input
                                                    type="number"
                                                    value={trimRange.start.toFixed(2)}
                                                    onChange={(e) => handleTrimRangeChange('start', Number(e.target.value))}
                                                    step={0.1}
                                                    min={0}
                                                    max={duration}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">End Time</label>
                                                <Input
                                                    type="number"
                                                    value={trimRange.end.toFixed(2)}
                                                    onChange={(e) => handleTrimRangeChange('end', Number(e.target.value))}
                                                    step={0.1}
                                                    min={0}
                                                    max={duration}
                                                />
                                            </div>
                                        </div>

                                        {trimError && (
                                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                {trimError}
                                            </div>
                                        )}

                                        <div className="text-sm text-muted-foreground">
                                            Duration: {formatTime(trimRange.end - trimRange.start)}
                                        </div>

                                        {isProcessing && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Processing...</span>
                                                    <span>{processingProgress}%</span>
                                                </div>
                                                <Progress value={processingProgress} />
                                            </div>
                                        )}

                                        <Button 
                                            onClick={processVideoTrim} 
                                            disabled={isProcessing || !!trimError}
                                            className="w-full"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Scissors className="h-4 w-4 mr-2" />
                                            )}
                                            Trim Video
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Video Info Panel */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Video Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">File Name</label>
                                            <p className="text-sm truncate">{videoFile.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">File Size</label>
                                            <p className="text-sm">{videoFile.size}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                            <p className="text-sm">{formatTime(videoFile.duration)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Current Time</label>
                                            <p className="text-sm">{formatTime(currentTime)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Playback Speed</label>
                                            <p className="text-sm">{playbackRate}x</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t">
                                        <Button variant="outline" className="w-full">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Video
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}