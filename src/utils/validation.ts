import {MEDIA_CONFIG} from '../constants/config';
import {ValidationResult, FileInfo} from '../types';

export const validation = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password: string): boolean => {
    return Boolean(password && password.length >= 6);
  },

  isValidVideo: (file: FileInfo | null): ValidationResult => {
    if (!file) {
      return {valid: false, error: 'No file selected'};
    }

    if (!MEDIA_CONFIG.ALLOWED_VIDEO_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid video format. Allowed: MP4, MOV, AVI',
      };
    }

    if (file.size > MEDIA_CONFIG.MAX_VIDEO_SIZE) {
      return {
        valid: false,
        error: `Video size exceeds ${MEDIA_CONFIG.MAX_VIDEO_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    return {valid: true};
  },

  isValidImage: (file: FileInfo | null): ValidationResult => {
    if (!file) {
      return {valid: false, error: 'No file selected'};
    }

    if (!MEDIA_CONFIG.ALLOWED_IMAGE_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid image format. Allowed: JPEG, PNG, GIF',
      };
    }

    if (file.size > MEDIA_CONFIG.MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Image size exceeds ${MEDIA_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    return {valid: true};
  },

  isRequired: (value: string | undefined | null): boolean => {
    return Boolean(value && value.toString().trim().length > 0);
  },
};
