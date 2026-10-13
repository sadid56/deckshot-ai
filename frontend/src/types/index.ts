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
  duration: number; // Duration in seconds (5, 10, 30, 60, 120)
  frames: number;
  steps: number;
  fps: number;
  aspectRatio: string; // "16:9" | "9:16" | "1:1"
  negativePrompt: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  recommended_hardware: string;
  default_fps: number;
  default_steps: number;
  default_frames: number;
  installed: boolean;
  dependencies: string[];
}
