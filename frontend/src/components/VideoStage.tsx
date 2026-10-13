import React from 'react';
import { Card, Box, Typography, Stack, Chip, Button } from '@mui/material';
import { PlayCircle as PlayCircleIcon, Download as DownloadIcon } from '@mui/icons-material';

interface VideoStageProps {
  videoUrl: string | null;
}

export const VideoStage: React.FC<VideoStageProps> = ({ videoUrl }) => {
  return (
    <Card
      sx={{
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {videoUrl ? (
        <Box>
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            playsInline
            style={{ width: '100%', maxHeight: 460, backgroundColor: '#000', display: 'block' }}
          />
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'rgba(14,16,25,0.85)',
            }}
          >
            <Chip
              label="HD RENDER READY"
              size="small"
              sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700 }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              href={videoUrl}
              download="ai_video.mp4"
              sx={{ bgcolor: '#6366f1' }}
            >
              Download Video
            </Button>
          </Box>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ p: 4, textAlign: 'center', color: '#64748b', alignItems: 'center' }}>
          <PlayCircleIcon sx={{ fontSize: 64, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ color: '#cbd5e1' }}>
            Video Preview Stage
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 320 }}>
            Upload your reference image, type a motion prompt, and click Generate to see the rendered video here.
          </Typography>
        </Stack>
      )}
    </Card>
  );
};
