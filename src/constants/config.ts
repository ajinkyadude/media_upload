export const API_BASE_URL: string = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.production.com/api';

export const MEDIA_CONFIG = {
  MIN_VIDEO_SIZE: 700 * 1024 * 1024,
  MAX_VIDEO_SIZE: 900 * 1024 * 1024,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  CHUNK_SIZE: 5 * 1024 * 1024,
  MAX_RETRY_PER_CHUNK: 3,
  ALLOWED_VIDEO_FORMATS: [
    'video/mp4',
    'video/quicktime',
    'video/x-matroska',
    'video/matroska',
    'video/mpeg',
    'video/mpg',
    'video/mp2t',
    'video/x-msvideo',
    'video/avi',
    'video/msvideo',
    'video/webm',
    'video/hevc',
    'video/x-hevc',
    'video/h265',
    'video/x-ms-wmv',
    'video/3gpp',
    'video/3gpp2',
    'video/mp4v-es',
    'video/x-m4v',
  ] as readonly string[],
  ALLOWED_VIDEO_EXTENSIONS: [
    '.mp4', '.mov', '.mkv', '.mpeg', '.mpg', '.avi',
    '.webm', '.hevc', '.h265', '.wmv', '.3gp', '.3g2',
    '.m4v', '.ts', '.mts',
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
