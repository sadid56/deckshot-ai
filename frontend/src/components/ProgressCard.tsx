import React from 'react';
import { Card, Box, Typography, LinearProgress } from '@mui/material';

interface ProgressCardProps {
  progress: number;
  progressPhase: string;
  logs: string[];
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress, progressPhase, logs }) => {
  return (
    <Card
      sx={{
        p: 2.5,
        border: '1px solid rgba(99,102,241,0.4)',
        boxShadow: '0 10px 30px rgba(99,102,241,0.2)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#06b6d4' }} />
          {progressPhase}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}
        >
          {progress}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': { bgcolor: '#06b6d4' },
        }}
      />

      {/* Log Terminal Window */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: '#06070a',
          border: '1px solid rgba(255,255,255,0.06)',
          maxHeight: 120,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: '#38bdf8',
          lineHeight: 1.6,
        }}
      >
        {logs.map((log, i) => (
          <div key={i}>&gt; {log}</div>
        ))}
      </Box>
    </Card>
  );
};
