export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  url: string;
  thumbnail?: string;
  size: number;
  duration?: number;
  createdAt: string;
}

export interface MediaState {
  mediaList: MediaItem[];
  uploadedItems: MediaItem[];
  selectedMedia: MediaItem | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export interface MediaData {
  uri: string;
  type: string;
  name: string;
  size: number;
  title: string;
}

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  uploadedMedia: UploadedMedia | null;
}

export interface UploadedMedia {
  id: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileInfo {
  type: string;
  size: number;
}

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  List: undefined;
  AddVideo: undefined;
  AddPhoto: undefined;
  Upload: {mediaData: MediaData};
};

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: object;
  textStyle?: object;
}

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
  inputStyle?: object;
}

export interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export interface ErrorMessageProps {
  message: string | null;
  onRetry?: () => void;
  style?: object;
}

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
}

export enum StorageKeys {
  TOKEN = '@auth_token',
  USER = '@user_data',
  THEME = '@app_theme',
}
