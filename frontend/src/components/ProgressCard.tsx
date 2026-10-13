import React from 'react';
import { Card, Box, Typography, LinearProgress, Stack } from '@mui/material';
import { Terminal as TerminalIcon, Sync as SyncIcon } from '@mui/icons-material';
import { studioTokens } from '../theme/theme';

interface ProgressCardProps {
  progress: number;
  progressPhase: string;
  logs: string[];
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress, progressPhase, logs }) => {
  return (
    <Card sx={{ p: 2.5, bgcolor: studioTokens.bgPanel, border: `1px solid ${studioTokens.borderDefault}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
          <SyncIcon
            sx={{
              fontSize: 18,
              color: studioTokens.primary,
              animation: 'spin 2s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: studioTokens.textPrimary }}>
            {progressPhase}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ fontWeight: 700, color: studioTokens.primaryLight, fontFamily: 'monospace' }}>
          {progress}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: studioTokens.bgSubtle,
          '& .MuiLinearProgress-bar': {
            bgcolor: studioTokens.primary,
          },
        }}
      />

      {/* Log Terminal Window */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: studioTokens.bgInput,
          border: `1px solid ${studioTokens.borderDefault}`,
          maxHeight: 120,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: studioTokens.textSecondary,
          lineHeight: 1.6,
        }}
      >
        <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: 0.5, color: studioTokens.textMuted }}>
          <TerminalIcon sx={{ fontSize: 13 }} />
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            CONSOLE LOGS
          </Typography>
        </Stack>
        {logs.map((log, i) => (
          <div key={i}>&gt; {log}</div>
        ))}
      </Box>
    </Card>
  );
};
