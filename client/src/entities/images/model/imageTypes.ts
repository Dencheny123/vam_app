export interface Image {
  filename: string;
  usedIn: string[];
  url?: string;
}

export interface ImageState {
  images: Image[];
  loading: boolean;
  error: string | null;
}