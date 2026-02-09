export const API_BASE_URL: string = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.production.com/api';

export const MEDIA_CONFIG = {
  MAX_VIDEO_SIZE: 100 * 1024 * 1024,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  ALLOWED_VIDEO_FORMATS: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ] as readonly string[],
  ALLOWED_IMAGE_FORMATS: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ] as readonly string[],
  IMAGE_QUALITY: 0.8,
  VIDEO_QUALITY: 'medium',
} as const;

export const APP_CONFIG = {
  SPLASH_DURATION: 2000,
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;
