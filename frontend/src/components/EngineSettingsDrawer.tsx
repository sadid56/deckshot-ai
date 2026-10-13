import React from "react";
import { Drawer, Box, Stack, Typography, IconButton, Select, MenuItem, TextField, Button, Divider } from "@mui/material";
import {
  Close as CloseIcon,
  Tune as TuneIcon,
  RestartAlt as ResetIcon,
  Check as CheckIcon,
  TimerOutlined as TimerIcon,
  SmartDisplayOutlined as ModelIcon,
  FilterAltOutlined as FilterIcon,
  AspectRatioOutlined as AspectRatioIcon,
} from "@mui/icons-material";
import type { GenerationSettings } from "../types";
import { studioTokens } from "../theme/theme";

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
  const handleReset = () => {
    Object.entries(DEFAULT_SETTINGS).forEach(([key, val]) => {
      onUpdate(key as keyof GenerationSettings, val);
    });
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

      {/* 3 Simple Settings Controls */}
      <Stack spacing={3}>
        {/* 1. AI Video Model */}
        <Box>
          <Stack direction='row' spacing={1} sx={{ alignItems: "center", mb: 0.8 }}>
            <ModelIcon sx={{ fontSize: 17, color: studioTokens.primaryLight }} />
            <Typography variant='body2' sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
              AI Video Model
            </Typography>
          </Stack>
          <Select
            fullWidth
            size='small'
            value={settings.model}
            onChange={(e) => onUpdate("model", e.target.value)}
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
            <MenuItem value='ltx' sx={{ fontSize: "0.85rem" }}>
              Lightricks/LTX-Video (25 FPS - Recommended)
            </MenuItem>
            <MenuItem value='cogvideox' sx={{ fontSize: "0.85rem" }}>
              THUDM/CogVideoX-5B-I2V
            </MenuItem>
          </Select>
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
