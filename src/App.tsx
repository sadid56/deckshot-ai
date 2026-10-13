import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  Stack,
} from '@mui/material';
import {
  VideoCameraBackOutlined as MovieIcon,
  ViewCarouselOutlined as ViewCarouselIcon,
  MovieCreationOutlined as MovieCreationIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import { studioTokens } from './theme/theme';
import type { SceneItem, GenerationSettings } from "./types";
import { Header } from "./shared/Header";
import { SingleSceneTab } from "./features/home/SingleSceneTab";
import { MultiSceneTab } from "./features/home/MultiSceneTab";
import { EngineSettingsDrawer } from "./features/home/EngineSettingsDrawer";
import { ProgressCard } from "./features/home/ProgressCard";
import { VideoStage } from "./features/home/VideoStage";
import { RecentGenerations } from "./features/home/RecentGenerations";
import { useToast } from './context/ToastContext';
import { Tabs, Button } from './components/ui';
import { api, queryKeys, type GenerationResponse } from './api';
import { useAppQuery, useAppMutation } from './hooks';

export interface StudioFormValues {
  prompt: string;
  singleImageFile: File | null;
  singleImagePreview: string;
  scenes: SceneItem[];
  settings: GenerationSettings;
}

export default function App() {
  const toast = useToast();
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // React Hook Form
  const {
    watch,
    setValue,
    getValues,
    handleSubmit,
  } = useForm<StudioFormValues>({
    defaultValues: {
      prompt: '',
      singleImageFile: null,
      singleImagePreview: '',
      scenes: [
        {
          id: 1,
          file: null,
          imagePreview: '',
          prompt: '',
        },
        {
          id: 2,
          file: null,
          imagePreview: '',
          prompt: '',
        },
      ],
      settings: {
        model: "ltx",
        duration: 5,
        frames: 81,
        steps: 30,
        fps: 25,
        aspectRatio: "16:9",
        negativePrompt: "worst quality, blurry, distorted, glitch, sudden cuts, low resolution, artifacts",
      },
    },
  });

  // Watched Values for reactive UI
  const prompt = watch('prompt');
  const singleImageFile = watch('singleImageFile');
  const singleImagePreview = watch('singleImagePreview');
  const scenes = watch('scenes');
  const settings = watch('settings');

  // Generation & Status Tracking
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressPhase, setProgressPhase] = useState<string>('Idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: systemData } = useAppQuery({
    queryKey: queryKeys.system,
    queryFn: api.getSystem,
    showErrorToast: false,
  });
  const hardware = systemData?.device ? `${systemData.device} GPU ACCELERATION` : 'APPLE SILICON / MPS';

  const { data: recentVideos = [], refetch: refetchRecentVideos } = useAppQuery({
    queryKey: queryKeys.recentVideos,
    queryFn: api.getRecentVideos,
    showErrorToast: false,
  });

  const pollIntervalRef = useRef<any>(null);

  const handleUpdateSetting = (key: keyof GenerationSettings, value: any) => {
    setValue(`settings.${key}` as any, value);
  };

  // Single Scene Handlers
  const handleSingleImageSelected = (file: File) => {
    setValue('singleImageFile', file);
    const reader = new FileReader();
    reader.onload = (e) => setValue('singleImagePreview', e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSingleImageCleared = () => {
    setValue('singleImageFile', null);
    setValue('singleImagePreview', '');
  };

  // Multi-Scene Handlers
  const handleAddScene = () => {
    const currentScenes = getValues('scenes');
    const nextId = currentScenes.length > 0 ? Math.max(...currentScenes.map((s) => s.id)) + 1 : 1;
    setValue('scenes', [
      ...currentScenes,
      {
        id: nextId,
        file: null,
        imagePreview: '',
        prompt: '',
      },
    ]);
  };

  const handleRemoveScene = (id: number) => {
    setValue('scenes', getValues('scenes').filter((s) => s.id !== id));
  };

  const handleSceneImageUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setValue(
        'scenes',
        getValues('scenes').map((s) =>
          s.id === id ? { ...s, file, imagePreview: e.target?.result as string } : s
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleScenePromptChange = (id: number, text: string) => {
    setValue(
      'scenes',
      getValues('scenes').map((s) => (s.id === id ? { ...s, prompt: text } : s))
    );
  };

  const startPolling = (jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const job = await api.getJobStatus(jobId);

        setProgress(job.progress);
        if (job.progress < 25) setProgressPhase('Initializing Diffusion Pipeline...');
        else if (job.progress < 70) setProgressPhase('Neural Latent Denoising...');
        else if (job.progress < 99) setProgressPhase('Encoding High-Definition Video...');
        else setProgressPhase('Render Complete!');

        if (job.logs) setLogs(job.logs);

        if (job.status === 'completed') {
          clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          setOutputVideoUrl(job.video_url);
          toast.success('Cinematic video rendered successfully!');
          queryClient.invalidateQueries({ queryKey: queryKeys.recentVideos });
        } else if (job.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          toast.error(`Render failed: ${job.error || 'Unknown error'}`);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);
  };

  // Generation Mutations
  const singleSceneMutation = useAppMutation<FormData, GenerationResponse>({
    mutationFn: (formData) => api.generateSingle(formData),
    errorMessage: 'Single scene generation submission failed',
    onSuccess: (res) => {
      startPolling(res.job_id);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const multiSceneMutation = useAppMutation<FormData, GenerationResponse>({
    mutationFn: (formData) => api.generateScenes(formData),
    errorMessage: 'Storyboard sequence generation submission failed',
    onSuccess: (res) => {
      startPolling(res.job_id);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  // Generation Dispatcher (React Hook Form onSubmit)
  const onSubmit = async (data: StudioFormValues) => {
    // Validation
    if (tabIndex === 0) {
      if (!data.prompt.trim()) {
        toast.error('Please provide a prompt describing your video.');
        return;
      }
    } else {
      const emptyPrompt = data.scenes.some((s) => !s.prompt.trim());
      if (emptyPrompt) {
        toast.error('Please provide a prompt for each scene in your storyboard.');
        return;
      }
    }

    setIsGenerating(true);
    setProgress(5);
    setProgressPhase('Submitting job...');
    setLogs(['Job queued for rendering...']);

    const formData = new FormData();
    formData.append('model', data.settings.model);
    formData.append('duration', (data.settings.duration || 5).toString());
    formData.append('steps', data.settings.steps.toString());
    formData.append('frames', data.settings.frames.toString());
    formData.append('fps', data.settings.fps.toString());
    formData.append('aspect_ratio', data.settings.aspectRatio || '16:9');
    formData.append('negative_prompt', data.settings.negativePrompt);

    if (tabIndex === 0) {
      formData.append('prompt', data.prompt);
      if (data.singleImageFile) {
        formData.append('image', data.singleImageFile);
      }
      singleSceneMutation.mutate(formData);
    } else {
      const scenesPayload = data.scenes.map((s) => {
        let filename = '';
        if (s.file) {
          filename = s.file.name;
          formData.append('images', s.file, filename);
        }
        return { image: filename, prompt: s.prompt };
      });
      formData.append('scenes_json', JSON.stringify(scenesPayload));
      multiSceneMutation.mutate(formData);
    }
  };

  return (
    <Box sx={{ bgcolor: studioTokens.bgCanvas, minHeight: '100vh', color: studioTokens.textPrimary }}>
      {/* Header with Settings Trigger */}
      <Header hardware={hardware} />

      {/* Main Studio Body */}
      <Container maxWidth='xl' sx={{ py: 3.5 }}>

        {/* Studio Top Bar: Mode Switcher + Quick Engine Specs Badge */}
        <Tabs
          value={tabIndex}
          onChange={(val) => setTabIndex(val)}
          containerSx={{ mb: 3.5 }}
          items={[
            {
              value: 0,
              label: "Single Scene (Text / Image to Video)",
              icon: <MovieIcon sx={{ fontSize: 18 }} />,
            },
            {
              value: 1,
              label: "Multi-Scene Storyboard",
              icon: <ViewCarouselIcon sx={{ fontSize: 18 }} />,
            },
          ]}
          rightElement={
            <Button
              variant='outlined'
              size='small'
              startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
              onClick={() => setIsSettingsOpen(true)}
              sx={{
                height: 40,
                px: 2,
                borderRadius: `${studioTokens.radiusMd}px`,
                fontSize: "0.82rem",
                fontWeight: 500,
                borderColor: studioTokens.borderDefault,
                color: studioTokens.textSecondary,
                bgcolor: studioTokens.bgPanel,
                "&:hover": {
                  borderColor: studioTokens.primary,
                  color: studioTokens.textPrimary,
                  bgcolor: studioTokens.bgSubtle,
                },
              }}
            >
              {settings.model.toUpperCase()} • {settings.duration >= 60 ? `${settings.duration / 60} Min` : `${settings.duration}s`} Video
            </Button>
          }
        />

        {/* 2-Column Grid Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.15fr 1fr" },
            gap: 3.5,
            alignItems: "start",
          }}
        >
          {/* Left Column: Creator Controls */}
          <Stack spacing={2.5}>
            {tabIndex === 0 ? (
              <SingleSceneTab
                imageFile={singleImageFile}
                imagePreview={singleImagePreview}
                prompt={prompt}
                onImageSelected={handleSingleImageSelected}
                onImageCleared={handleSingleImageCleared}
                onPromptChange={(val) => setValue('prompt', val)}
              />
            ) : (
              <MultiSceneTab
                scenes={scenes}
                onAddScene={handleAddScene}
                onRemoveScene={handleRemoveScene}
                onSceneImageUpload={handleSceneImageUpload}
                onScenePromptChange={handleScenePromptChange}
              />
            )}

            {/* Primary Generate Button (Directly below Creator Controls) */}
            <Button
              variant='primary'
              size='large'
              loading={isGenerating}
              loadingText="Rendering Video in Studio..."
              onClick={handleSubmit(onSubmit)}
              startIcon={<MovieCreationIcon />}
              sx={{
                py: 1.6,
                letterSpacing: "0.01em",
              }}
            >
              Render Cinematic Video
            </Button>
          </Stack>

          {/* Right Column: Video Stage, Progress & History */}
          <Stack spacing={3}>
            {isGenerating && <ProgressCard progress={progress} progressPhase={progressPhase} logs={logs} />}

            <VideoStage videoUrl={outputVideoUrl} fps={settings.fps} aspectRatio={settings.aspectRatio} />

            <RecentGenerations
              recentVideos={recentVideos}
              currentVideoUrl={outputVideoUrl}
              onSelectVideo={setOutputVideoUrl}
              onRefresh={() => refetchRecentVideos()}
            />
          </Stack>
        </Box>
      </Container>

      {/* Right Slide-out Drawer for Engine Settings */}
      <EngineSettingsDrawer
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={handleUpdateSetting}
      />
    </Box>
  );
}
