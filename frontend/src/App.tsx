import { useState, useEffect, useRef } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Tabs,
  Tab,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  Movie as MovieIcon,
  ViewCarousel as ViewCarouselIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

import { darkTheme } from './theme/theme';
import type { SceneItem, RecentVideo, GenerationSettings } from './types';

import { Header } from './components/Header';
import { SingleSceneTab } from './components/SingleSceneTab';
import { MultiSceneTab } from './components/MultiSceneTab';
import { AdvancedSettings } from './components/AdvancedSettings';
import { ProgressCard } from './components/ProgressCard';
import { VideoStage } from './components/VideoStage';
import { RecentGenerations } from './components/RecentGenerations';

export default function App() {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [hardware, setHardware] = useState<string>('LOCAL ACCELERATOR');

  // Single Scene State (NO sample images - requires user upload)
  const [singleImageFile, setSingleImageFile] = useState<File | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string>('');
  const [prompt, setPrompt] = useState<string>(
    'Cinematic commercial product showcase. Smooth camera movement with elegant studio lighting, subtle light reflections across the surface, premium luxury presentation, high-definition details.'
  );

  // Multi-Scene State (Empty initial scenes awaiting user uploads)
  const [scenes, setScenes] = useState<SceneItem[]>([
    {
      id: 1,
      file: null,
      imagePreview: '',
      prompt: 'Cinematic slow camera pan around the subject with elegant studio lighting.',
    },
    {
      id: 2,
      file: null,
      imagePreview: '',
      prompt: 'Macro zoom into intricate details, high-tech display animation with soft reflections.',
    },
  ]);

  // Generation Settings
  const [settings, setSettings] = useState<GenerationSettings>({
    model: 'ltx',
    frames: 81,
    steps: 30,
    fps: 25,
    negativePrompt: 'worst quality, blurry, distorted, glitch, sudden cuts, low resolution, artifacts',
  });

  // Generation & Status Tracking
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressPhase, setProgressPhase] = useState<string>('Idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Single Scene Handlers
  const handleSingleImageSelected = (file: File) => {
    setSingleImageFile(file);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => setSingleImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSingleImageCleared = () => {
    setSingleImageFile(null);
    setSingleImagePreview('');
  };

  // Multi-Scene Handlers
  const handleAddScene = () => {
    const nextId = scenes.length > 0 ? Math.max(...scenes.map((s) => s.id)) + 1 : 1;
    setScenes([
      ...scenes,
      {
        id: nextId,
        file: null,
        imagePreview: '',
        prompt: 'Smooth cinematic reveal angle with elegant volumetric lighting.',
      },
    ]);
  };

  const handleRemoveScene = (id: number) => {
    setScenes(scenes.filter((s) => s.id !== id));
  };

  const handleSceneImageUpload = (id: number, file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setScenes((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, file, imagePreview: e.target?.result as string } : s
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleScenePromptChange = (id: number, text: string) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, prompt: text } : s)));
  };

  // Generation Dispatcher
  const handleGenerate = async () => {
    setErrorMessage(null);

    // Validation: Prompt is required; Image is optional
    if (tabIndex === 0) {
      if (!prompt.trim()) {
        setErrorMessage('Please provide a prompt describing your video.');
        return;
      }
    } else {
      const emptyPrompt = scenes.some((s) => !s.prompt.trim());
      if (emptyPrompt) {
        setErrorMessage('Please provide a prompt for each scene in your storyboard.');
        return;
      }
    }

    setIsGenerating(true);
    setProgress(5);
    setProgressPhase('Submitting job...');
    setLogs(['Job queued for rendering...']);

    const formData = new FormData();
    formData.append('model', settings.model);
    formData.append('steps', settings.steps.toString());
    formData.append('frames', settings.frames.toString());
    formData.append('fps', settings.fps.toString());
    formData.append('negative_prompt', settings.negativePrompt);

    let endpoint = '/api/generate';

    if (tabIndex === 0) {
      formData.append('prompt', prompt);
      if (singleImageFile) {
        formData.append('image', singleImageFile);
      }
    } else {
      endpoint = '/api/generate-scenes';
      const scenesPayload = scenes.map((s) => {
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
      const data = await res.json();
      startPolling(data.job_id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred during submission');
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
          fetchRecentVideos();
        } else if (job.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          setErrorMessage(`Render failed: ${job.error || 'Unknown error'}`);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Header */}
      <Header hardware={hardware} />

      {/* Main Studio Body */}
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Error Alert */}
        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Mode Selector Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            sx={{
              bgcolor: '#10121a',
              p: 0.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                borderRadius: 2.5,
                fontWeight: 600,
                color: '#94a3b8',
                minHeight: 44,
                px: 3,
                '&.Mui-selected': {
                  bgcolor: '#6366f1',
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                },
              },
            }}
          >
            <Tab icon={<MovieIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Single Scene (Product Ad)" />
            <Tab
              icon={<ViewCarouselIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Multi-Scene (Storyboard Presentation)"
            />
          </Tabs>
        </Box>

        {/* 2-Column Grid Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.15fr 1fr' },
            gap: 3.5,
            alignItems: 'start',
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
                onPromptChange={setPrompt}
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

            {/* Advanced Settings */}
            <AdvancedSettings settings={settings} onUpdate={handleUpdateSetting} />

            {/* Primary Generate Button */}
            <Button
              variant="contained"
              size="large"
              disabled={isGenerating}
              onClick={handleGenerate}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                py: 1.8,
                fontSize: '1.05rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                  boxShadow: '0 12px 35px rgba(99,102,241,0.6)',
                },
              }}
            >
              {isGenerating ? 'Rendering Video in Studio...' : 'Generate Cinematic Video'}
            </Button>
          </Stack>

          {/* Right Column: Video Stage, Progress & History */}
          <Stack spacing={3}>
            {isGenerating && (
              <ProgressCard progress={progress} progressPhase={progressPhase} logs={logs} />
            )}

            <VideoStage videoUrl={outputVideoUrl} />

            <RecentGenerations
              recentVideos={recentVideos}
              currentVideoUrl={outputVideoUrl}
              onSelectVideo={setOutputVideoUrl}
              onRefresh={fetchRecentVideos}
            />
          </Stack>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
