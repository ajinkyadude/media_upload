export const helpers = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  formatDuration: (seconds: number | undefined): string => {
    if (!seconds) {
      return '00:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  truncateText: (text: string | undefined | null, maxLength: number = 50): string => {
    if (!text) {
      return '';
    }
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  },

  debounce: <T extends (...args: unknown[]) => void>(
    func: T,
    wait: number,
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function executedFunction(...args: Parameters<T>) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  },

  getFileExtension: (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  },

  getMimeTypeFromExtension: (filename: string): string | null => {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeMap: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      mkv: 'video/x-matroska',
      mpeg: 'video/mpeg',
      mpg: 'video/mpeg',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      hevc: 'video/hevc',
      h265: 'video/hevc',
      wmv: 'video/x-ms-wmv',
      '3gp': 'video/3gpp',
      '3g2': 'video/3gpp2',
      m4v: 'video/x-m4v',
      ts: 'video/mp2t',
      mts: 'video/mp2t',
    };
    return ext ? mimeMap[ext] || null : null;
  },

  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },
};
