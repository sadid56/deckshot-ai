import React from 'react';
import { Card, Box, Typography, Stack, Chip, Button } from '@mui/material';
import {
  DownloadOutlined as DownloadIcon,
  CheckCircleOutlined as CheckIcon,
  VideocamOutlined as VideocamIcon,
} from '@mui/icons-material';
import { studioTokens } from '../theme/theme';

interface VideoStageProps {
  videoUrl: string | null;
  fps?: number;
  aspectRatio?: string;
}

export const VideoStage: React.FC<VideoStageProps> = ({ videoUrl, fps = 25, aspectRatio = "16:9" }) => {
  const [detectedRatio, setDetectedRatio] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!videoUrl) {
      setDetectedRatio(null);
    }
  }, [videoUrl]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      const r = w / h;
      if (Math.abs(r - 16 / 9) < 0.08) setDetectedRatio("16:9");
      else if (Math.abs(r - 9 / 16) < 0.08) setDetectedRatio("9:16");
      else if (Math.abs(r - 1) < 0.08) setDetectedRatio("1:1");
      else if (Math.abs(r - 4 / 3) < 0.08) setDetectedRatio("4:3");
      else if (Math.abs(r - 21 / 9) < 0.08) setDetectedRatio("21:9");
      else {
        const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));
        const divisor = gcd(w, h);
        setDetectedRatio(`${Math.round(w / divisor)}:${Math.round(h / divisor)}`);
      }
    }
  };

  const currentRatio = detectedRatio || aspectRatio || "16:9";
  const currentFps = fps || 25;

  return (
    <Card
      sx={{
        overflow: "hidden",
        border: `1px solid ${studioTokens.borderDefault}`,
        bgcolor: studioTokens.bgPanel,
      }}
    >
      {/* Studio Viewport Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: studioTokens.bgInput,
          borderBottom: `1px solid ${studioTokens.borderDefault}`,
        }}
      >
        <Stack direction='row' spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: videoUrl ? studioTokens.success : studioTokens.textMuted,
            }}
          />
          <Typography
            variant='caption'
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: studioTokens.textSecondary,
              letterSpacing: "0.05em",
            }}
          >
            {`VIEWPORT 01 • ${currentRatio} • ${currentFps} FPS`}
          </Typography>
        </Stack>
        <Chip
          label={videoUrl ? "RENDER READY" : "STANDBY"}
          size='small'
          sx={{
            height: 18,
            fontSize: "0.62rem",
            fontWeight: 700,
            bgcolor: videoUrl ? studioTokens.successSubtle : studioTokens.bgSubtle,
            color: videoUrl ? studioTokens.success : studioTokens.textMuted,
            border: `1px solid ${videoUrl ? studioTokens.successSubtle : studioTokens.borderDefault}`,
          }}
        />
      </Box>

      {/* Viewport Content */}
      {videoUrl ? (
        <Box>
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            style={{ width: "100%", maxHeight: 460, backgroundColor: "#000000", display: "block" }}
          />
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: studioTokens.bgInput,
              borderTop: `1px solid ${studioTokens.borderDefault}`,
            }}
          >
            <Stack direction='row' spacing={1} sx={{ alignItems: "center" }}>
              <CheckIcon sx={{ fontSize: 18, color: studioTokens.success }} />
              <Typography variant='body2' sx={{ fontWeight: 600, color: studioTokens.textPrimary }}>
                Diffusion Render Complete
              </Typography>
            </Stack>
            <Button
              variant='contained'
              size='small'
              startIcon={<DownloadIcon />}
              href={videoUrl}
              download='ai_video.mp4'
              sx={{
                bgcolor: studioTokens.primary,
                "&:hover": { bgcolor: studioTokens.primaryHover },
              }}
            >
              Export MP4
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            minHeight: 380,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            textAlign: "center",
            bgcolor: studioTokens.bgCanvas,
            position: "relative",
          }}
        >
          {/* Viewport Frame guides */}
          <Box
            sx={{
              position: "absolute",
              inset: 16,
              border: `1px solid ${studioTokens.borderDefault}`,
              borderRadius: 1,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: studioTokens.bgElevated,
              border: `1px solid ${studioTokens.borderDefault}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <VideocamIcon sx={{ fontSize: 28, color: studioTokens.textMuted }} />
          </Box>
          <Typography variant='subtitle1' sx={{ color: studioTokens.textPrimary, fontWeight: 600, mb: 0.5 }}>
            Studio Viewport Ready
          </Typography>
          <Typography variant='body2' sx={{ maxWidth: 300, color: studioTokens.textMuted, fontSize: "0.85rem" }}>
            Set prompt parameters and trigger render to stream the output video directly into this monitor.
          </Typography>
        </Box>
      )}
    </Card>
  );
};
