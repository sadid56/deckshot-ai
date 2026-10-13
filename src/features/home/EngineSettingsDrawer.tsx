import React from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import {
  Tune as TuneIcon,
  RestartAlt as ResetIcon,
  Check as CheckIcon,
  TimerOutlined as TimerIcon,
  SmartDisplayOutlined as ModelIcon,
  FilterAltOutlined as FilterIcon,
  AspectRatioOutlined as AspectRatioIcon,
  DownloadDoneOutlined as InstalledIcon,
  CloudDownloadOutlined as DownloadIcon,
} from "@mui/icons-material";
import type { GenerationSettings } from "../../types";
import { studioTokens } from "../../theme/theme";
import { Sidebar, Dropdown, Textarea, Button } from "../../components/ui";
import { api, queryKeys, type InstallResponse } from "../../api";
import { useAppQuery, useAppMutation } from "../../hooks";

interface EngineSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  settings: GenerationSettings;
  onUpdate: (key: keyof GenerationSettings, value: any) => void;
}

const DEFAULT_SETTINGS: GenerationSettings = {
  model: "ltx",
  duration: 5,
  frames: 81,
  steps: 30,
  fps: 25,
  aspectRatio: "16:9",
  negativePrompt: "worst quality, blurry, distorted, glitch, sudden cuts, low resolution, artifacts",
};

export const EngineSettingsDrawer: React.FC<EngineSettingsDrawerProps> = ({ open, onClose, settings, onUpdate }) => {
  // TanStack Query for models
  const { data: models = [] } = useAppQuery({
    queryKey: queryKeys.models,
    queryFn: api.getModels,
    enabled: open,
  });

  // App Mutation for installing model dependencies
  const installMutation = useAppMutation<string, InstallResponse>({
    mutationFn: (modelId: string) => api.installModelDependencies(modelId),
    invalidateKeys: [queryKeys.models],
    successMessage: (res) => `Dependencies for ${res.model_id.toUpperCase()} installed successfully!`,
    errorMessage: "Failed to install model dependencies",
  });

  const handleReset = () => {
    Object.entries(DEFAULT_SETTINGS).forEach(([key, val]) => {
      onUpdate(key as keyof GenerationSettings, val);
    });
  };

  const handleModelChange = (modelId: string) => {
    onUpdate("model", modelId);
    const selected = models.find((m) => m.id === modelId);
    if (selected) {
      if (selected.default_fps) onUpdate("fps", selected.default_fps);
      if (selected.default_steps) onUpdate("steps", selected.default_steps);
      if (selected.default_frames) onUpdate("frames", selected.default_frames);
    }
  };

  const handleInstallDependencies = (modelId: string) => {
    installMutation.mutate(modelId);
  };

  const handleDurationChange = (durationSec: number) => {
    onUpdate("duration", durationSec);
    if (durationSec <= 5) {
      onUpdate("frames", 81);
    } else if (durationSec <= 10) {
      onUpdate("frames", 161);
    } else {
      onUpdate("frames", 121);
    }
  };

  const selectedModel = models.find((m) => m.id === settings.model);

  return (
    <Sidebar
      open={open}
      onClose={onClose}
      title='Engine Settings'
      subtitle='Model & video duration configuration'
      icon={<TuneIcon sx={{ fontSize: 20, color: studioTokens.primaryLight }} />}
      footer={
        <Stack direction='row' spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant='secondary'
            size='small'
            startIcon={<ResetIcon sx={{ fontSize: 16 }} />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant='primary'
            size='small'
            startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
            onClick={onClose}
          >
            Apply Settings
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* 1. AI Video Model Dropdown */}
        <Box>
          <Dropdown
            label='AI Video Model'
            icon={<ModelIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />}
            value={settings.model}
            onChange={handleModelChange}
            headerRight={
              selectedModel && (
                <Chip
                  size='small'
                  label={selectedModel.installed ? "Ready" : "Deps Missing"}
                  icon={
                    selectedModel.installed ? (
                      <InstalledIcon sx={{ fontSize: "14px !important" }} />
                    ) : (
                      <DownloadIcon sx={{ fontSize: "14px !important" }} />
                    )
                  }
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    bgcolor: selectedModel.installed ? studioTokens.successSubtle : studioTokens.warningSubtle,
                    color: selectedModel.installed ? studioTokens.successText : studioTokens.warning,
                    border: `1px solid ${selectedModel.installed ? studioTokens.successBorder : studioTokens.warningBorder}`,
                  }}
                />
              )
            }
            options={models.map((m) => ({
              value: m.id,
              label: m.name,
            }))}
          />

          {/* If selected model dependencies need installing */}
          {selectedModel && !selectedModel.installed && (
            <Button
              variant='secondary'
              size='small'
              fullWidth
              loading={installMutation.isPending}
              loadingText="Installing Dependencies..."
              onClick={() => handleInstallDependencies(selectedModel.id)}
              startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
              sx={{
                mt: 1,
                fontSize: "0.75rem",
                color: studioTokens.warning,
                borderColor: studioTokens.warningBorder,
              }}
            >
              Install {selectedModel.id.toUpperCase()} Dependencies
            </Button>
          )}
        </Box>

        {/* 2. Target Video Duration Dropdown */}
        <Box>
          <Dropdown
            label='Video Duration & Capacity'
            icon={<TimerIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />}
            value={settings.duration || 5}
            onChange={(val) => handleDurationChange(Number(val))}
            options={[
              { value: 5, label: "5 Seconds • Social Media Teaser" },
              { value: 10, label: "10 Seconds • Product Showcase" },
              { value: 30, label: "30 Seconds • Commercial Ad Spot" },
              { value: 60, label: "60 Seconds (1 Min) • Full Presentation" },
              { value: 120, label: "120 Seconds (2 Min) • Extended Cinematic Story" },
            ]}
          />
          <Typography variant='caption' sx={{ color: studioTokens.textMuted, display: "block", mt: 0.8, fontSize: "0.73rem" }}>
            {settings.duration >= 30
              ? "Multi-shot cinematic sequencing automatically links sequential scenes into a full 1–2 min master MP4."
              : "Direct high-fidelity diffusion clip generated locally."}
          </Typography>
        </Box>

        {/* 3. Target Aspect Ratio */}
        <Box>
          <Stack direction='row' spacing={1} sx={{ alignItems: "center", mb: 0.8 }}>
            <AspectRatioIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />
            <Typography variant='body2' sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
              Aspect Ratio
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            {[
              { label: "16:9 Landscape", val: "16:9" },
              { label: "9:16 Vertical", val: "9:16" },
              { label: "1:1 Square", val: "1:1" },
            ].map((r) => {
              const isSelected = (settings.aspectRatio || "16:9") === r.val;
              return (
                <Button
                  key={r.val}
                  size='small'
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => onUpdate("aspectRatio", r.val)}
                  sx={{
                    flex: 1,
                    py: 0.6,
                    fontSize: "0.78rem",
                  }}
                >
                  {r.val}
                </Button>
              );
            })}
          </Stack>
        </Box>

        {/* 4. Negative Prompt Filter */}
        <Textarea
          label='Negative Filter (Optional)'
          labelIcon={<FilterIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />}
          rows={2.5}
          value={settings.negativePrompt}
          onChange={(e) => onUpdate("negativePrompt", e.target.value)}
          placeholder='blurry, distorted, sudden cuts, glitch artifacts...'
        />
      </Stack>
    </Sidebar>
  );
};
