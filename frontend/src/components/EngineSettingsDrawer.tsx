import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
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
import type { GenerationSettings, ModelInfo } from "../types";
import { studioTokens } from "../theme/theme";
import { useToast } from "../context/ToastContext";

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
  const toast = useToast();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/models");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setModels(data);
        }
      }
    } catch {
      // Keep defaults if server is initializing
    }
  };

  useEffect(() => {
    if (open) {
      fetchModels();
    }
  }, [open]);

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

  const handleInstallDependencies = async (modelId: string) => {
    setIsInstalling(true);
    toast.info(`Installing Python dependencies for ${modelId.toUpperCase()}...`);
    try {
      const res = await fetch(`/api/models/${modelId}/install`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.installed) {
        toast.success(`Dependencies for ${modelId.toUpperCase()} installed successfully!`);
        await fetchModels();
      } else {
        toast.error(`Installation failed: ${data.detail || "Unknown error"}`);
      }
    } catch (e: any) {
      toast.error(`Install error: ${e.message || "Failed to reach backend"}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDurationChange = (durationSec: number) => {
    onUpdate("duration", durationSec);
    // Automatically configure optimal frames & steps based on duration
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
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            width: { xs: "100vw", sm: 400 },
            bgcolor: studioTokens.bgPanel,
            backgroundImage: "none !important",
            borderLeft: "1px solid rgba(255, 255, 255, 0.16)",
            boxShadow: "-20px 0 50px rgba(0, 0, 0, 0.9)",
            p: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Stack direction='row' spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: studioTokens.primarySubtle,
              border: `1px solid ${studioTokens.primarySubtle}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TuneIcon sx={{ fontSize: 20, color: studioTokens.primaryLight }} />
          </Box>
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: studioTokens.textPrimary, lineHeight: 1.2 }}>
              Engine Settings
            </Typography>
            <Typography variant='caption' sx={{ color: studioTokens.textMuted, fontSize: "0.75rem" }}>
              Model & video duration configuration
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size='small'
          onClick={onClose}
          sx={{
            color: studioTokens.textSecondary,
            bgcolor: studioTokens.bgInput,
            border: `1px solid ${studioTokens.borderDefault}`,
            "&:hover": { color: studioTokens.textPrimary, bgcolor: studioTokens.bgSubtle },
          }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: studioTokens.borderDefault, mb: 3 }} />

      {/* Settings Controls */}
      <Stack spacing={3}>
        {/* 1. AI Video Model (Dynamic from backend) */}
        <Box>
          <Stack direction='row' spacing={1} sx={{ alignItems: "center", mb: 0.8, justifyContent: "space-between" }}>
            <Stack direction='row' spacing={1} sx={{ alignItems: "center" }}>
              <ModelIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />
              <Typography variant='body2' sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
                AI Video Model
              </Typography>
            </Stack>
            {selectedModel && (
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
                  bgcolor: selectedModel.installed ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  color: selectedModel.installed ? "#34d399" : "#fbbf24",
                  border: `1px solid ${selectedModel.installed ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                }}
              />
            )}
          </Stack>
          <Select
            fullWidth
            size='small'
            value={settings.model}
            onChange={(e) => handleModelChange(e.target.value)}
            renderValue={(val) => {
              const m = models.find((item) => item.id === val);
              return (
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: studioTokens.textPrimary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {m ? m.name : val}
                </Typography>
              );
            }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              slotProps: {
                paper: {
                  sx: {
                    width: { xs: "calc(100vw - 48px)", sm: 352 },
                    boxSizing: "border-box",
                    bgcolor: `${studioTokens.bgElevated} !important`,
                    backgroundImage: "none !important",
                    border: "1px solid rgba(255, 255, 255, 0.14) !important",
                    boxShadow: `0 22px 50px rgba(0, 0, 0, 0.92), 0 0 0 1px ${studioTokens.borderDefault} !important`,
                    borderRadius: "10px !important",
                    mt: 0.6,
                    p: 0.5,
                  },
                },
              },
            }}
            sx={{
              bgcolor: studioTokens.bgInput,
              color: studioTokens.textPrimary,
              borderRadius: 1.5,
              fontSize: "0.88rem",
              border: `1px solid ${studioTokens.borderDefault}`,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "& .MuiSelect-select": {
                py: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          >
            {models.map((m) => (
              <MenuItem
                key={m.id}
                value={m.id}
                sx={{
                  fontSize: "0.85rem",
                  py: 1,
                  borderRadius: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: studioTokens.textPrimary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                    width: "100%",
                  }}
                >
                  {m.name}
                </Typography>
              </MenuItem>
            ))}
          </Select>

          {/* If selected model dependencies need installing */}
          {selectedModel && !selectedModel.installed && (
            <Button
              variant='outlined'
              size='small'
              fullWidth
              disabled={isInstalling}
              onClick={() => handleInstallDependencies(selectedModel.id)}
              startIcon={isInstalling ? <CircularProgress size={14} color='inherit' /> : <DownloadIcon sx={{ fontSize: 16 }} />}
              sx={{
                mt: 1,
                py: 0.6,
                fontSize: "0.75rem",
                color: "#fbbf24",
                borderColor: "rgba(245, 158, 11, 0.4)",
                bgcolor: "rgba(245, 158, 11, 0.08)",
                "&:hover": {
                  bgcolor: "rgba(245, 158, 11, 0.15)",
                  borderColor: "#fbbf24",
                },
              }}
            >
              {isInstalling ? "Installing Dependencies..." : `Install ${selectedModel.id.toUpperCase()} Dependencies`}
            </Button>
          )}
        </Box>

        {/* 2. Target Video Duration (Supports 1-2 Minutes!) */}
        <Box>
          <Stack direction='row' spacing={1} sx={{ alignItems: "center", mb: 0.8 }}>
            <TimerIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />
            <Typography variant='body2' sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
              Video Duration & Capacity
            </Typography>
          </Stack>
          <Select
            fullWidth
            size='small'
            value={settings.duration || 5}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              slotProps: {
                paper: {
                  sx: {
                    width: { xs: "calc(100vw - 48px)", sm: 352 },
                    boxSizing: "border-box",
                    bgcolor: `${studioTokens.bgElevated} !important`,
                    backgroundImage: "none !important",
                    border: "1px solid rgba(255, 255, 255, 0.14) !important",
                    boxShadow: `0 22px 50px rgba(0, 0, 0, 0.92), 0 0 0 1px ${studioTokens.borderDefault} !important`,
                    borderRadius: "10px !important",
                    mt: 0.6,
                    p: 0.5,
                  },
                },
              },
            }}
            sx={{
              bgcolor: studioTokens.bgInput,
              color: studioTokens.textPrimary,
              borderRadius: 1.5,
              fontSize: "0.88rem",
              border: `1px solid ${studioTokens.borderDefault}`,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover": { borderColor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            <MenuItem value={5} sx={{ fontSize: "0.85rem" }}>
              5 Seconds • Social Media Teaser
            </MenuItem>
            <MenuItem value={10} sx={{ fontSize: "0.85rem" }}>
              10 Seconds • Product Showcase
            </MenuItem>
            <MenuItem value={30} sx={{ fontSize: "0.85rem" }}>
              30 Seconds • Commercial Ad Spot
            </MenuItem>
            <MenuItem value={60} sx={{ fontSize: "0.85rem" }}>
              60 Seconds (1 Min) • Full Presentation
            </MenuItem>
            <MenuItem value={120} sx={{ fontSize: "0.85rem" }}>
              120 Seconds (2 Min) • Extended Cinematic Story
            </MenuItem>
          </Select>
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
                  variant='outlined'
                  onClick={() => onUpdate("aspectRatio", r.val)}
                  sx={{
                    flex: 1,
                    py: 0.6,
                    fontSize: "0.78rem",
                    fontWeight: isSelected ? 700 : 500,
                    bgcolor: isSelected ? studioTokens.primarySubtle : studioTokens.bgInput,
                    color: isSelected ? studioTokens.primaryLight : studioTokens.textSecondary,
                    borderColor: isSelected ? studioTokens.primaryLight : studioTokens.borderDefault,
                    "&:hover": {
                      bgcolor: isSelected ? studioTokens.primarySubtle : studioTokens.bgSubtle,
                      borderColor: studioTokens.primaryLight,
                      color: studioTokens.textPrimary,
                    },
                  }}
                >
                  {r.val}
                </Button>
              );
            })}
          </Stack>
        </Box>

        {/* 4. Negative Prompt Filter */}
        <Box>
          <Stack direction='row' spacing={1} sx={{ alignItems: "center", mb: 0.8 }}>
            <FilterIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />
            <Typography variant='body2' sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
              Negative Filter (Optional)
            </Typography>
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={2.5}
            size='small'
            value={settings.negativePrompt}
            onChange={(e) => onUpdate("negativePrompt", e.target.value)}
            placeholder='blurry, distorted, sudden cuts, glitch artifacts...'
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: studioTokens.bgInput,
                borderRadius: 1.5,
                fontSize: "0.84rem",
                lineHeight: 1.5,
              },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: studioTokens.borderDefault, pt: 1 }} />

        {/* Action Buttons */}
        <Stack direction='row' spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant='outlined'
            size='small'
            startIcon={<ResetIcon sx={{ fontSize: 16 }} />}
            onClick={handleReset}
            sx={{
              borderColor: studioTokens.borderDefault,
              color: studioTokens.textSecondary,
              bgcolor: studioTokens.bgInput,
              fontSize: "0.82rem",
              "&:hover": {
                borderColor: studioTokens.primary,
                color: studioTokens.textPrimary,
                bgcolor: studioTokens.bgSubtle,
              },
            }}
          >
            Reset
          </Button>
          <Button
            variant='contained'
            size='small'
            startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
            onClick={onClose}
            sx={{
              px: 3,
              bgcolor: studioTokens.primary,
              fontWeight: 600,
              fontSize: "0.84rem",
              "&:hover": { bgcolor: studioTokens.primaryHover },
            }}
          >
            Apply Settings
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};
