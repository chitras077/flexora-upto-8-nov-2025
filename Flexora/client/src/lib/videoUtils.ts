// lib/videoUtils.ts
export interface VideoInfo {
    duration: number;
    width: number;
    height: number;
    bitrate: number;
    format: string;
}

export const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const getVideoInfo = (file: File): Promise<VideoInfo> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.addEventListener('loadedmetadata', () => {
            const info: VideoInfo = {
                duration: video.duration || 0,
                width: video.videoWidth || 1920,
                height: video.videoHeight || 1080,
                bitrate: file.size / (video.duration || 1),
                format: file.type || 'video/mp4'
            };
            URL.revokeObjectURL(url);
            resolve(info);
        });

        video.addEventListener('error', (e) => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load video metadata'));
        });

        video.src = url;
    });
};

export const getVideoThumbnails = async (file: File, count: number): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        const thumbnails: string[] = [];
        let thumbnailsGenerated = 0;

        video.addEventListener('loadedmetadata', () => {
            const duration = video.duration;
            const interval = duration / count;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            const generateThumbnail = (time: number) => {
                video.currentTime = time;
            };

            video.addEventListener('seeked', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const thumbnailUrl = canvas.toDataURL('image/jpeg');
                thumbnails.push(thumbnailUrl);
                thumbnailsGenerated++;

                if (thumbnailsGenerated === count) {
                    URL.revokeObjectURL(url);
                    resolve(thumbnails);
                }
            });

            // Generate thumbnails at different timestamps
            for (let i = 0; i < count; i++) {
                const time = (i * interval);
                generateThumbnail(time);
            }
        });

        video.addEventListener('error', () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load video for thumbnails'));
        });

        video.src = url;
    });
};