export const queryKeys = {
  system: ["system"] as const,
  recentVideos: ["recent-videos"] as const,
  models: ["models"] as const,
  jobStatus: (jobId: string) => ["job-status", jobId] as const,
};
