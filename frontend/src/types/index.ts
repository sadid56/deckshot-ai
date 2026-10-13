export interface SceneItem {
  id: number;
  file: File | null;
  imagePreview: string;
  prompt: string;
}

export interface RecentVideo {
  filename: string;
  url: string;
  created_at: string;
}

export interface GenerationSettings {
  model: string;
  frames: number;
  steps: number;
  fps: number;
  negativePrompt: string;
}
