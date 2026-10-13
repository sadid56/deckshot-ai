import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export const apiClient: AxiosInstance = axios.create({
  baseURL: "",
  timeout: 120000, // 2 minutes timeout for model downloads/generation calls
  headers: {
    "Accept": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    const customMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred";

    // Attach parsed message to Error for convenient access
    error.message = customMessage;
    return Promise.reject(error);
  }
);
