import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.mov', '.mkv', '.mpeg', '.mpg', '.avi',
  '.webm', '.hevc', '.h265', '.265', '.wmv', '.3gp', '.3g2',
  '.m4v', '.ts', '.mts',
]);

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
]);

const getCacheDirectories = (): string[] => {
  const dirs: string[] = [];

  if (RNFS.TemporaryDirectoryPath) {
    dirs.push(RNFS.TemporaryDirectoryPath);
  }
  if (RNFS.CachesDirectoryPath) {
    dirs.push(RNFS.CachesDirectoryPath);
  }
  if (RNFS.DocumentDirectoryPath) {
    dirs.push(RNFS.DocumentDirectoryPath);
  }

  return dirs;
};

const isInCacheDir = (filePath: string): boolean => {
  const normalizedPath = filePath.replace('file://', '').replace(/\/+/g, '/');
  const dirs = getCacheDirectories();

  for (const dir of dirs) {
    const normalizedDir = dir.replace('file://', '').replace(/\/+/g, '/');
    if (normalizedPath.startsWith(normalizedDir)) {
      return true;
    }
  }

  if (Platform.OS === 'ios' && normalizedPath.includes('/tmp/')) {
    return true;
  }

  if (Platform.OS === 'android') {
    if (
      normalizedPath.includes('/cache/') ||
      normalizedPath.includes('/files/') ||
      normalizedPath.includes('/app_') ||
      normalizedPath.includes('/Android/data/')
    ) {
      if (!normalizedPath.startsWith('/storage/') && !normalizedPath.startsWith('/sdcard/')) {
        return true;
      }
    }
  }

  return false;
};

const scanDirectoryRecursive = async (
  dirPath: string,
  maxDepth: number = 3,
  currentDepth: number = 0,
): Promise<Array<{path: string; name: string; size: number}>> => {
  const files: Array<{path: string; name: string; size: number}> = [];

  if (currentDepth >= maxDepth) {
    return files;
  }

  try {
    const exists = await RNFS.exists(dirPath);
    if (!exists) {
      return files;
    }

    const items = await RNFS.readDir(dirPath);

    for (const item of items) {
      if (item.isDirectory()) {
        const subFiles = await scanDirectoryRecursive(item.path, maxDepth, currentDepth + 1);
        files.push(...subFiles);
      } else {
        const ext = ('.' + (item.name.split('.').pop() || '')).toLowerCase();
        const isMedia = VIDEO_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext);

        if (isMedia) {
          files.push({
            path: item.path,
            name: item.name,
            size: item.size || 0,
          });
        }
      }
    }
  } catch (err) {
    console.warn(`Cache cleanup: failed to scan directory ${dirPath}:`, err);
  }

  return files;
};

const deleteFileIfInCache = async (uri: string | undefined | null): Promise<boolean> => {
  if (!uri) {
    return false;
  }

  try {
    const filePath = uri.replace('file://', '');

    if (!isInCacheDir(filePath)) {
      return false;
    }

    const exists = await RNFS.exists(filePath);
    if (!exists) {
      return false;
    }

    await RNFS.unlink(filePath);
    return true;
  } catch (err) {
    console.warn('Cache cleanup: failed to delete file:', uri, err);
    return false;
  }
};

export const cacheService = {
  cleanupMediaFiles: async (
    videoUri: string | undefined | null,
    thumbnailUri: string | undefined | null,
  ): Promise<{videoDeleted: boolean; thumbnailDeleted: boolean}> => {
    const [videoDeleted, thumbnailDeleted] = await Promise.all([
      deleteFileIfInCache(videoUri),
      deleteFileIfInCache(thumbnailUri),
    ]);

    return {videoDeleted, thumbnailDeleted};
  },

  cleanupAllCacheFiles: async (): Promise<{deletedCount: number; freedBytes: number}> => {
    let deletedCount = 0;
    let freedBytes = 0;
    const dirs = getCacheDirectories();

    for (const dir of dirs) {
      try {
        const files = await scanDirectoryRecursive(dir, 3);

        for (const file of files) {
          if (isInCacheDir(file.path)) {
            try {
              await RNFS.unlink(file.path);
              deletedCount++;
              freedBytes += file.size;
            } catch (unlinkErr) {
              console.warn(`Cache cleanup: failed to delete ${file.name}:`, unlinkErr);
            }
          }
        }
      } catch (dirErr) {
        console.warn(`Cache cleanup: failed to process directory ${dir}:`, dirErr);
      }
    }

    if (deletedCount > 0) {
      console.log(
        `Cache cleanup: removed ${deletedCount} file(s), freed ${Math.round(freedBytes / 1024 / 1024)}MB`,
      );
    }

    return {deletedCount, freedBytes};
  },
};
