import React, { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Video,
    Upload,
    Play,
    Pause,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
    Fullscreen,
    Download,
    X,
    Scissors,
    Wrench,
    AlertCircle,
    Loader2,
    Shrink,
    RotateCcw as Reverse,
    Music
} from "lucide-react";
import { useVideoProcessor } from "@/hooks/useVideoProcessor";
import { getVideoInfo, getVideoThumbnails, formatTime, VideoInfo } from "@/lib/videoUtils";

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

interface ExportFormat {
    id: string;
    name: string;
    extension: string;
    type: 'video' | 'audio';
    mimeType: string;
}

const EnterpriseVideoEditor: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playbackOptionsRef = useRef<HTMLDivElement>(null);

    // Enhanced video processor hook
    const {
        isProcessing,
        progress,
        stage,
        trimVideo,
        compressVideo,
        reverseVideo,
        extractAudio,
        loadFFmpeg
    } = useVideoProcessor();

    // Video state
    const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Tools state
    const [showTools, setShowTools] = useState(false);
    const [showTrimTool, setShowTrimTool] = useState(false);
    const [showAdvancedTools, setShowAdvancedTools] = useState(false);
    const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 0 });
    const [trimError, setTrimError] = useState('');

    // Export state
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportedFileUrl, setExportedFileUrl] = useState<string | null>(null);
    const [exportedFileName, setExportedFileName] = useState('');

    const exportFormats: ExportFormat[] = [
        { id: 'mp4', name: 'MP4 Video', extension: '.mp4', type: 'video', mimeType: 'video/mp4' },
        { id: 'webm', name: 'WebM Video', extension: '.webm', type: 'video', mimeType: 'video/webm' },
        { id: 'mp3', name: 'MP3 Audio', extension: '.mp3', type: 'audio', mimeType: 'audio/mpeg' },
        { id: 'wav', name: 'WAV Audio', extension: '.wav', type: 'audio', mimeType: 'audio/wav' }
    ];

    // Load FFmpeg when component mounts
    useEffect(() => {
        loadFFmpeg().catch(console.error);
    }, [loadFFmpeg]);

    // Enhanced file upload handler with video info and thumbnails
    const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            console.log("File selected:", file.name, "Size:", formatFileSize(file.size));

            // Validate file type
            const validTypes = [
                '.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v', '.wmv', '.flv', '.3gp',
                'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
                'video/x-matroska', 'video/x-m4v', 'video/x-ms-wmv', 'video/x-flv', 'video/3gpp'
            ];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!validTypes.includes(fileExtension) && !validTypes.includes(file.type)) {
                alert('Please select a valid video file (MP4, MOV, AVI, WebM, MKV, M4V, WMV, FLV, 3GP)');
                return;
            }

            // 4GB file size limit
            const maxSize = 4 * 1024 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size too large. Please select a video under 4GB.');
                return;
            }

            setIsLoading(true);
            const url = URL.createObjectURL(file);

            try {
                // Get video info and thumbnails
                const info = await getVideoInfo(file);
                const thumbs = await getVideoThumbnails(file, 6);

                const newVideoFile: VideoFile = {
                    file,
                    url,
                    name: file.name,
                    size: formatFileSize(file.size),
                    duration: info.duration
                };

                setVideoFile(newVideoFile);
                setVideoInfo(info);
                setThumbnails(thumbs);
                setDuration(info.duration);
                setCurrentTime(0);
                setIsPlaying(false);
                setPlaybackRate(1);
                setTrimRange({ start: 0, end: info.duration });
                setTrimError('');

            } catch (error) {
                console.error('Error loading video:', error);
                alert('Error loading video file. Please try another file.');
                URL.revokeObjectURL(url);
            } finally {
                setIsLoading(false);
                setShowTools(false);
                setShowTrimTool(false);
                setShowAdvancedTools(false);

                // Clear previous exported file
                if (exportedFileUrl) {
                    URL.revokeObjectURL(exportedFileUrl);
                    setExportedFileUrl(null);
                }
            }
        }
    }, [exportedFileUrl]);

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Video control functions
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
                });
            }
        }
    }, [isPlaying]);

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
        setShowPlaybackOptions(false);
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

    const toggleFullscreen = async () => {
        const element = videoRef.current?.parentElement;
        if (!element) return;

        try {
            if (!document.fullscreenElement) {
                await element.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
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
        alert('Error playing video. The file may be corrupted or in an unsupported format.');
        setIsPlaying(false);
        setIsLoading(false);
    };

    // Cleanup URLs when component unmounts
    useEffect(() => {
        return () => {
            if (videoFile) {
                URL.revokeObjectURL(videoFile.url);
            }
            if (exportedFileUrl) {
                URL.revokeObjectURL(exportedFileUrl);
            }
            // Clean up thumbnails
            thumbnails.forEach(thumb => URL.revokeObjectURL(thumb));
        };
    }, [videoFile, exportedFileUrl, thumbnails]);

    // Reset to upload screen
    const handleReset = () => {
        if (videoFile) {
            URL.revokeObjectURL(videoFile.url);
        }
        if (exportedFileUrl) {
            URL.revokeObjectURL(exportedFileUrl);
        }
        // Clean up thumbnails
        thumbnails.forEach(thumb => URL.revokeObjectURL(thumb));

        setVideoFile(null);
        setVideoInfo(null);
        setThumbnails([]);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setPlaybackRate(1);
        setShowTools(false);
        setShowTrimTool(false);
        setShowAdvancedTools(false);
        setShowExportDialog(false);
        setExportedFileUrl(null);
        setTrimError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Toggle tools section
    const toggleTools = () => {
        setShowTools(!showTools);
        if (!showTools) {
            setShowTrimTool(true);
        }
    };

    // Handle trim range change with validation
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

    // Enhanced video processing functions with better error handling
    const processVideoTrim = async (format: ExportFormat) => {
        if (!videoFile) {
            alert('No video file selected');
            return;
        }

        if (trimRange.end - trimRange.start < 0.1) {
            alert('Trim duration must be at least 0.1 seconds');
            return;
        }

        try {
            console.log('Starting video trim process...', {
                format: format.id,
                start: trimRange.start,
                end: trimRange.end,
                duration: trimRange.end - trimRange.start
            });

            const result = await trimVideo(
                videoFile.file,
                trimRange.start,
                trimRange.end,
                format.id as 'mp4' | 'webm' | 'mp3' | 'wav'
            );

            if (!result || !result.url) {
                throw new Error('No URL returned from trim operation');
            }

            // Clean up previous exported file
            if (exportedFileUrl) {
                URL.revokeObjectURL(exportedFileUrl);
            }

            const originalName = videoFile.name.split('.')[0];
            const fileName = `${originalName}_trimmed_${formatTime(trimRange.start)}_to_${formatTime(trimRange.end)}${format.extension}`;

            setExportedFileUrl(result.url);
            setExportedFileName(fileName);
            setShowExportDialog(false);

            // Auto-download the file
            const a = document.createElement('a');
            a.href = result.url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            console.log('Video trim completed successfully');
            alert(`✅ Successfully exported trimmed ${format.name}!\nDuration: ${formatTime(trimRange.end - trimRange.start)}`);

        } catch (error) {
            console.error('Video processing error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Error processing video: ${errorMessage}\n\nPlease ensure FFmpeg is properly loaded and try again.`);
        }
    };

    // Advanced video operations
    const handleCompressVideo = async () => {
        if (!videoFile) {
            alert('No video file selected');
            return;
        }

        try {
            const result = await compressVideo(videoFile.file, {
                width: 1280,
                height: 720,
                crf: 28
            });

            if (!result || !result.url) {
                throw new Error('No URL returned from compression operation');
            }

            const fileName = `compressed_${videoFile.name.split('.')[0]}.mp4`;
            downloadFile(result.url, fileName);
            alert('✅ Video compressed successfully!');
        } catch (error) {
            console.error('Compression error:', error);
            alert(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleReverseVideo = async () => {
        if (!videoFile) {
            alert('No video file selected');
            return;
        }

        try {
            const result = await reverseVideo(videoFile.file);

            if (!result || !result.url) {
                throw new Error('No URL returned from reverse operation');
            }

            const fileName = `reversed_${videoFile.name.split('.')[0]}.mp4`;
            downloadFile(result.url, fileName);
            alert('✅ Video reversed successfully!');
        } catch (error) {
            console.error('Reverse error:', error);
            alert(`Reverse failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleExtractAudio = async (format: 'mp3' | 'wav') => {
        if (!videoFile) {
            alert('No video file selected');
            return;
        }

        try {
            const result = await extractAudio(videoFile.file, format);

            if (!result || !result.url) {
                throw new Error('No URL returned from audio extraction operation');
            }

            const fileName = `audio_${videoFile.name.split('.')[0]}.${format}`;
            downloadFile(result.url, fileName);
            alert(`✅ Audio extracted successfully as ${format.toUpperCase()}!`);
        } catch (error) {
            console.error('Audio extraction error:', error);
            alert(`Audio extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const downloadFile = (url: string, fileName: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const previewTrimmedSection = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = trimRange.start;
            setCurrentTime(trimRange.start);
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(console.error);
        }
    };

    // Keyboard shortcuts and other effects
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!videoFile) return;

            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skipBackward();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skipForward();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [videoFile, togglePlayPause, skipBackward, skipForward, toggleMute, toggleFullscreen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (playbackOptionsRef.current && !playbackOptionsRef.current.contains(event.target as Node)) {
                setShowPlaybackOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const trimStartPercent = duration > 0 ? (trimRange.start / duration) * 100 : 0;
    const trimEndPercent = duration > 0 ? (trimRange.end / duration) * 100 : 0;
    const trimDuration = trimRange.end - trimRange.start;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-gray-200 mb-6">
                        <Video className="h-6 w-6 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">ENTERPRISE VIDEO EDITOR</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                        Professional Video Studio
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Complete video editing suite with support for large files up to 4GB
                    </p>
                </div>

                {!videoFile ? (
                    // Upload Area
                    <div className="max-w-2xl mx-auto">
                        <Card className="shadow-lg border-0">
                            <CardHeader className="text-center pb-4">
                                <CardTitle>Get Started</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-2xl p-12 hover:border-blue-500 transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:scale-[1.02]"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium mb-2">Upload Video to Get Started</p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Supports MP4, MOV, AVI, WebM, MKV (Max 4GB)
                                        </p>
                                        <Button
                                            size="lg"
                                            className="gap-2"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-4 w-4" />
                                            Choose Video File
                                        </Button>
                                    </div>
                                    <Input
                                        type="file"
                                        accept=".mp4,.mov,.avi,.webm,.mkv,.m4v,.wmv,.flv,.3gp,video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                        ref={fileInputRef}
                                    />
                                    {isLoading && (
                                        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading video...
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    // Video Player Section
                    <div className="max-w-6xl mx-auto">
                        <Card className="shadow-xl border-0 overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 truncate">
                                        <Video className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                        <span className="truncate" title={videoFile.name}>{videoFile.name}</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                                            <span className="font-medium">{videoFile.size}</span>
                                            <span>• {formatTime(duration)}</span>
                                            {videoInfo && (
                                                <span>• {videoInfo.width}×{videoInfo.height}</span>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleReset}
                                            className="h-8 w-8"
                                            title="Upload new video"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* Video Player */}
                                <div className="relative bg-black group">
                                    <video
                                        ref={videoRef}
                                        src={videoFile.url}
                                        className="w-full max-h-[70vh] object-contain"
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={handleVideoEnd}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onError={handleVideoError}
                                        onLoadedMetadata={(e) => {
                                            const video = e.currentTarget as HTMLVideoElement;
                                            setDuration(video.duration);
                                            video.playbackRate = playbackRate;
                                        }}
                                        playsInline
                                    />

                                    {/* Loading Overlay */}
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="text-white text-lg">Loading video...</div>
                                        </div>
                                    )}

                                    {/* Video Controls Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300">

                                        {/* Seek Bar */}
                                        <div className="mb-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration}
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                                                style={{
                                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${seekProgress}%, #4b5563 ${seekProgress}%, #4b5563 100%)`
                                                }}
                                            />
                                            <div className="flex justify-between text-xs text-gray-300 mt-1">
                                                <span>{formatTime(currentTime)}</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>

                                        {/* Control Buttons */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Play/Pause */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={togglePlayPause}
                                                    className="text-white hover:bg-white/20 h-10 w-10"
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="h-5 w-5" />
                                                    ) : (
                                                        <Play className="h-5 w-5" />
                                                    )}
                                                </Button>

                                                {/* Skip Backward */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={skipBackward}
                                                    className="text-white hover:bg-white/20 h-8 w-8"
                                                    title="Skip backward 10s"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>

                                                {/* Skip Forward */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={skipForward}
                                                    className="text-white hover:bg-white/20 h-8 w-8"
                                                    title="Skip forward 10s"
                                                >
                                                    <RotateCw className="h-4 w-4" />
                                                </Button>

                                                {/* Volume Control */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={toggleMute}
                                                        className="text-white hover:bg-white/20 h-8 w-8"
                                                    >
                                                        {isMuted || volume === 0 ? (
                                                            <VolumeX className="h-4 w-4" />
                                                        ) : (
                                                            <Volume2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.1"
                                                        value={volume}
                                                        onChange={handleVolumeChange}
                                                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                                    />
                                                </div>

                                                {/* Playback Rate */}
                                                <div className="relative" ref={playbackOptionsRef}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowPlaybackOptions(!showPlaybackOptions)}
                                                        className="text-white hover:bg-white/20"
                                                    >
                                                        Speed: {playbackRate}x
                                                    </Button>
                                                    {showPlaybackOptions && (
                                                        <div className="absolute bottom-full mb-2 left-0 bg-gray-800 rounded-lg shadow-lg p-2 z-10 min-w-24">
                                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                                                <button
                                                                    key={rate}
                                                                    onClick={() => changePlaybackRate(rate)}
                                                                    className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-700 ${
                                                                        playbackRate === rate ? 'text-blue-400 font-medium' : 'text-white'
                                                                    }`}
                                                                >
                                                                    {rate}x Speed
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Fullscreen */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={toggleFullscreen}
                                                    className="text-white hover:bg-white/20 h-8 w-8"
                                                >
                                                    <Fullscreen className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Play button overlay for when video is paused */}
                                    {!isPlaying && currentTime > 0 && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                            onClick={togglePlayPause}
                                        >
                                            <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
                                                <Play className="h-12 w-12 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnails Section */}
                                {thumbnails.length > 0 && (
                                    <div className="p-4 bg-gray-50 border-b">
                                        <h4 className="text-sm font-medium mb-3">Video Preview</h4>
                                        <div className="grid grid-cols-6 gap-2">
                                            {thumbnails.map((thumb, index) => {
                                                const time = (index * duration) / thumbnails.length;
                                                return (
                                                    <img
                                                        key={index}
                                                        src={thumb}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => {
                                                            if (videoRef.current) {
                                                                videoRef.current.currentTime = time;
                                                                setCurrentTime(time);
                                                            }
                                                        }}
                                                        title={`Jump to ${formatTime(time)}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="p-6 bg-white border-t">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <Button
                                            onClick={handleReset}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Upload New Video
                                        </Button>
                                        <Button
                                            onClick={toggleTools}
                                            variant={showTools ? "default" : "outline"}
                                            className="gap-2"
                                        >
                                            <Wrench className="h-4 w-4" />
                                            Tools
                                        </Button>
                                        <Button
                                            onClick={() => setShowExportDialog(true)}
                                            className="gap-2"
                                            disabled={trimDuration < 0.1 || isProcessing}
                                        >
                                            <Download className="h-4 w-4" />
                                            Export Trimmed Video
                                            {isProcessing && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Tools Section */}
                                {showTools && (
                                    <div className="border-t bg-gray-50 p-6">
                                        <div className="flex items-center gap-4 mb-6">
                                            <h3 className="text-lg font-semibold">Video Tools</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Button
                                                    onClick={() => { setShowTrimTool(true); setShowAdvancedTools(false); }}
                                                    variant={showTrimTool ? "default" : "outline"}
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    <Scissors className="h-4 w-4" />
                                                    TRIM VIDEO
                                                </Button>
                                                <Button
                                                    onClick={() => { setShowAdvancedTools(true); setShowTrimTool(false); }}
                                                    variant={showAdvancedTools ? "default" : "outline"}
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    <Wrench className="h-4 w-4" />
                                                    ADVANCED TOOLS
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Trim Tool */}
                                        {showTrimTool && (
                                            <div className="bg-white rounded-lg border p-6">
                                                <h4 className="text-md font-medium mb-4 flex items-center gap-2">
                                                    <Scissors className="h-4 w-4" />
                                                    Trim Video
                                                    {trimDuration >= 0.1 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ml-2">
                                                            Ready to Export
                                                        </span>
                                                    )}
                                                </h4>

                                                <div className="space-y-6">
                                                    {/* Error Message */}
                                                    {trimError && (
                                                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                            <span className="text-sm text-red-700">{trimError}</span>
                                                        </div>
                                                    )}

                                                    {/* Trim Range Slider */}
                                                    <div className="space-y-4">
                                                        <label className="text-sm font-medium">Select Trim Range</label>
                                                        <div className="relative h-12 bg-gray-200 rounded-lg cursor-pointer">
                                                            {/* Background */}
                                                            <div className="absolute inset-0 rounded-lg bg-gray-300"></div>

                                                            {/* Selected Range */}
                                                            <div
                                                                className="absolute h-full bg-blue-500 rounded-lg"
                                                                style={{
                                                                    left: `${trimStartPercent}%`,
                                                                    width: `${trimEndPercent - trimStartPercent}%`
                                                                }}
                                                            ></div>

                                                            {/* Start Handle */}
                                                            <div
                                                                className="absolute top-1/2 transform -translate-y-1/2 w-6 h-8 bg-white border-2 border-blue-500 rounded cursor-ew-resize shadow-lg hover:bg-blue-50 flex items-center justify-center"
                                                                style={{ left: `calc(${trimStartPercent}% - 12px)` }}
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                                                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                                                        const percentage = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                                                                        const newTime = percentage * duration;
                                                                        handleTrimRangeChange('start', newTime);
                                                                    };

                                                                    const handleMouseUp = () => {
                                                                        document.removeEventListener('mousemove', handleMouseMove);
                                                                        document.removeEventListener('mouseup', handleMouseUp);
                                                                    };

                                                                    document.addEventListener('mousemove', handleMouseMove);
                                                                    document.addEventListener('mouseup', handleMouseUp);
                                                                }}
                                                            >
                                                                <div className="w-1 h-4 bg-blue-500"></div>
                                                            </div>

                                                            {/* End Handle */}
                                                            <div
                                                                className="absolute top-1/2 transform -translate-y-1/2 w-6 h-8 bg-white border-2 border-blue-500 rounded cursor-ew-resize shadow-lg hover:bg-blue-50 flex items-center justify-center"
                                                                style={{ left: `calc(${trimEndPercent}% - 12px)` }}
                                                                onMouseDown={(e) => {
                                                                    e.stopPropagation();
                                                                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                                                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                                                        const percentage = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                                                                        const newTime = percentage * duration;
                                                                        handleTrimRangeChange('end', newTime);
                                                                    };

                                                                    const handleMouseUp = () => {
                                                                        document.removeEventListener('mousemove', handleMouseMove);
                                                                        document.removeEventListener('mouseup', handleMouseUp);
                                                                    };

                                                                    document.addEventListener('mousemove', handleMouseMove);
                                                                    document.addEventListener('mouseup', handleMouseUp);
                                                                }}
                                                            >
                                                                <div className="w-1 h-4 bg-blue-500"></div>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>Start: {formatTime(trimRange.start)}</span>
                                                            <span>End: {formatTime(trimRange.end)}</span>
                                                            <span className="font-medium">Duration: {formatTime(trimDuration)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Time Inputs */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium mb-2 block">Start Time (seconds)</label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={duration}
                                                                step="0.1"
                                                                value={trimRange.start.toFixed(1)}
                                                                onChange={(e) => handleTrimRangeChange('start', parseFloat(e.target.value))}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                {formatTime(trimRange.start)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium mb-2 block">End Time (seconds)</label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={duration}
                                                                step="0.1"
                                                                value={trimRange.end.toFixed(1)}
                                                                onChange={(e) => handleTrimRangeChange('end', parseFloat(e.target.value))}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                {formatTime(trimRange.end)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-3 pt-4 border-t">
                                                        <Button
                                                            onClick={previewTrimmedSection}
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-2"
                                                            disabled={trimDuration < 0.1}
                                                        >
                                                            <Play className="h-4 w-4" />
                                                            Preview Trimmed Section
                                                        </Button>
                                                        <Button
                                                            onClick={() => setShowExportDialog(true)}
                                                            size="sm"
                                                            className="gap-2"
                                                            disabled={trimDuration < 0.1 || isProcessing}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Export Trimmed Video
                                                            {isProcessing && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                                                        </Button>
                                                        <Button
                                                            onClick={() => setTrimRange({ start: 0, end: duration })}
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            Reset to Full Video
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Advanced Tools */}
                                        {showAdvancedTools && (
                                            <div className="bg-white rounded-lg border p-6">
                                                <h4 className="text-md font-medium mb-4 flex items-center gap-2">
                                                    <Wrench className="h-4 w-4" />
                                                    Advanced Video Tools
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Button
                                                        onClick={handleCompressVideo}
                                                        variant="outline"
                                                        className="gap-2 h-auto py-3"
                                                        disabled={isProcessing}
                                                    >
                                                        <Shrink className="h-4 w-4" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Compress Video</div>
                                                            <div className="text-xs text-gray-500">Reduce file size (720p)</div>
                                                        </div>
                                                    </Button>

                                                    <Button
                                                        onClick={handleReverseVideo}
                                                        variant="outline"
                                                        className="gap-2 h-auto py-3"
                                                        disabled={isProcessing}
                                                    >
                                                        <Reverse className="h-4 w-4" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Reverse Video</div>
                                                            <div className="text-xs text-gray-500">Play video backwards</div>
                                                        </div>
                                                    </Button>

                                                    <Button
                                                        onClick={() => handleExtractAudio('mp3')}
                                                        variant="outline"
                                                        className="gap-2 h-auto py-3"
                                                        disabled={isProcessing}
                                                    >
                                                        <Music className="h-4 w-4" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Extract MP3</div>
                                                            <div className="text-xs text-gray-500">Audio only</div>
                                                        </div>
                                                    </Button>

                                                    <Button
                                                        onClick={() => handleExtractAudio('wav')}
                                                        variant="outline"
                                                        className="gap-2 h-auto py-3"
                                                        disabled={isProcessing}
                                                    >
                                                        <Music className="h-4 w-4" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Extract WAV</div>
                                                            <div className="text-xs text-gray-500">High quality audio</div>
                                                        </div>
                                                    </Button>
                                                </div>

                                                {isProcessing && (
                                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                                            <div>
                                                                <p className="font-medium text-blue-800">{stage}</p>
                                                                <Progress value={progress} className="mt-2 w-full" />
                                                                <p className="text-sm text-blue-600 mt-1">{progress}% Complete</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Keyboard Shortcuts Help */}
                        <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-lg border">
                            <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                                <div>Space: Play/Pause</div>
                                <div>← →: Skip 10s</div>
                                <div>F: Fullscreen</div>
                                <div>M: Mute/Unmute</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Format Dialog */}
                {showExportDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-90 zoom-in-90">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <Download className="h-5 w-5 text-blue-600" />
                                    Export Format
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowExportDialog(false)}
                                    className="h-8 w-8"
                                    disabled={isProcessing}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Choose your preferred format for the trimmed video:
                            </p>

                            {isProcessing ? (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                                        <p className="font-medium">{stage}</p>
                                        <p className="text-sm text-gray-500 mt-1">This may take a while depending on video length</p>
                                    </div>
                                    <Progress value={progress} className="w-full" />
                                    <div className="text-center text-sm text-gray-500">
                                        {progress}% Complete
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {exportFormats.map((format) => (
                                            <button
                                                key={format.id}
                                                onClick={() => processVideoTrim(format)}
                                                className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] group"
                                                disabled={isProcessing}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900 group-hover:text-blue-700">
                                                            {format.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {format.type === 'video' ? 'Video file' : 'Audio only'}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600">
                                                        {format.extension}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 text-center">
                                            Trimmed from {formatTime(trimRange.start)} to {formatTime(trimRange.end)}
                                            <br />
                                            Duration: {formatTime(trimDuration)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnterpriseVideoEditor;