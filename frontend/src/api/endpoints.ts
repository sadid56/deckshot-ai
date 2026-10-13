import { apiClient } from "./client";
import type { ModelInfo, RecentVideo } from "../types";

export interface SystemInfo {
  device: string;
}

export interface GenerationResponse {
  job_id: string;
  status: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  video_url: string | null;
  error?: string | null;
  logs?: string[];
}

export interface InstallResponse {
  model_id: string;
  installed: boolean;
  detail?: string;
}

export const api = {
  // System hardware specs
  getSystem: async (): Promise<SystemInfo> => {
    const { data } = await apiClient.get<SystemInfo>("/api/system");
    return data;
  },

  // Recent rendered video assets
  getRecentVideos: async (): Promise<RecentVideo[]> => {
    const { data } = await apiClient.get<RecentVideo[]>("/api/recent-videos");
    return data;
  },

  // Available AI models
  getModels: async (): Promise<ModelInfo[]> => {
    const { data } = await apiClient.get<ModelInfo[]>("/api/models");
    return data;
  },

  // Install dependencies for a specific model engine
  installModelDependencies: async (modelId: string): Promise<InstallResponse> => {
    const { data } = await apiClient.post<InstallResponse>(`/api/models/${modelId}/install`);
    return data;
  },

  // Submit single scene generation job
  generateSingle: async (formData: FormData): Promise<GenerationResponse> => {
    const { data } = await apiClient.post<GenerationResponse>("/api/generate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Submit multi-scene storyboard generation job
  generateScenes: async (formData: FormData): Promise<GenerationResponse> => {
    const { data } = await apiClient.post<GenerationResponse>("/api/generate-scenes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Polling job rendering status
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const { data } = await apiClient.get<JobStatusResponse>(`/api/status/${jobId}`);
    return data;
  },
};
