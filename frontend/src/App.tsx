import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Button,
  Stack,
} from '@mui/material';
import {
  VideoCameraBackOutlined as MovieIcon,
  ViewCarouselOutlined as ViewCarouselIcon,
  MovieCreationOutlined as MovieCreationIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import { studioTokens } from './theme/theme';
import type { SceneItem, RecentVideo, GenerationSettings } from "./types";
import { Header } from './components/Header';
import { SingleSceneTab } from './components/SingleSceneTab';
import { MultiSceneTab } from './components/MultiSceneTab';
import { EngineSettingsDrawer } from './components/EngineSettingsDrawer';
import { ProgressCard } from './components/ProgressCard';
import { VideoStage } from './components/VideoStage';
import { RecentGenerations } from './components/RecentGenerations';
import { useToast } from './context/ToastContext';

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
  const [hardware, setHardware] = useState<string>('LOCAL ACCELERATOR');
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
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);

  const pollIntervalRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    fetch('/api/system')
      .then((res) => res.json())
      .then((data) => {
        if (data.device) setHardware(`${data.device} GPU ACCELERATION`);
      })
      .catch(() => setHardware('APPLE SILICON / MPS'));

    fetchRecentVideos();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const fetchRecentVideos = async () => {
    try {
      const res = await fetch('/api/recent-videos');
      if (res.ok) {
        const data = await res.json();
        setRecentVideos(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

    let endpoint = '/api/generate';

    if (tabIndex === 0) {
      formData.append('prompt', data.prompt);
      if (data.singleImageFile) {
        formData.append('image', data.singleImageFile);
      }
    } else {
      endpoint = '/api/generate-scenes';
      const scenesPayload = data.scenes.map((s) => {
        let filename = '';
        if (s.file) {
          filename = s.file.name;
          formData.append('images', s.file, filename);
        }
        return { image: filename, prompt: s.prompt };
      });
      formData.append('scenes_json', JSON.stringify(scenesPayload));
    }

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Generation failed');
      }
      const resData = await res.json();
      startPolling(resData.job_id);
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during submission');
      setIsGenerating(false);
    }
  };

  const startPolling = (jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        if (!res.ok) return;
        const job = await res.json();

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
          fetchRecentVideos();
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

  return (
    <Box sx={{ bgcolor: studioTokens.bgCanvas, minHeight: '100vh', color: studioTokens.textPrimary }}>
      {/* Header with Settings Trigger */}
      <Header hardware={hardware} />

      {/* Main Studio Body */}
      <Container maxWidth='xl' sx={{ py: 3.5 }}>

        {/* Studio Top Bar: Mode Switcher + Quick Engine Specs Badge */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3.5,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Segmented Mode Selector */}
          <Box
            sx={{
              display: "inline-flex",
              bgcolor: studioTokens.bgPanel,
              p: 0.6,
              borderRadius: 2.5,
              border: `1px solid ${studioTokens.borderDefault}`,
              gap: 0.5,
            }}
          >
            <Button
              onClick={() => setTabIndex(0)}
              startIcon={<MovieIcon sx={{ fontSize: 18 }} />}
              sx={{
                px: 2.5,
                py: 0.8,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.88rem",
                color: tabIndex === 0 ? studioTokens.textPrimary : studioTokens.textMuted,
                bgcolor: tabIndex === 0 ? studioTokens.bgElevated : "transparent",
                border: tabIndex === 0 ? `1px solid ${studioTokens.borderDefault}` : "1px solid transparent",
                "&:hover": {
                  bgcolor: tabIndex === 0 ? studioTokens.bgElevated : studioTokens.bgSubtle,
                },
              }}
            >
              Single Scene (Text / Image to Video)
            </Button>
            <Button
              onClick={() => setTabIndex(1)}
              startIcon={<ViewCarouselIcon sx={{ fontSize: 18 }} />}
              sx={{
                px: 2.5,
                py: 0.8,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.88rem",
                color: tabIndex === 1 ? studioTokens.textPrimary : studioTokens.textMuted,
                bgcolor: tabIndex === 1 ? studioTokens.bgElevated : "transparent",
                border: tabIndex === 1 ? `1px solid ${studioTokens.borderDefault}` : "1px solid transparent",
                "&:hover": {
                  bgcolor: tabIndex === 1 ? studioTokens.bgElevated : studioTokens.bgSubtle,
                },
              }}
            >
              Multi-Scene Storyboard
            </Button>
          </Box>

          {/* Quick Engine Specs Button (Opens Right Drawer) */}
          <Button
            variant='outlined'
            size='small'
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            onClick={() => setIsSettingsOpen(true)}
            sx={{
              height: 40,
              px: 2,
              borderRadius: 2.5,
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
        </Box>

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
              variant='contained'
              size='large'
              disabled={isGenerating}
              onClick={handleSubmit(onSubmit)}
              startIcon={<MovieCreationIcon />}
              sx={{
                py: 1.6,
                fontSize: "0.98rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
                borderRadius: 2,
                bgcolor: studioTokens.primary,
                border: `1px solid ${studioTokens.borderDefault}`,
                "&:hover": {
                  bgcolor: studioTokens.primaryHover,
                },
              }}
            >
              {isGenerating ? "Rendering Video in Studio..." : "Render Cinematic Video"}
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
              onRefresh={fetchRecentVideos}
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
