import { Card, Box, Typography, Tooltip, IconButton, Stack, Chip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import type { RecentVideo } from '../types';




interface RecentGenerationsProps {
  recentVideos: RecentVideo[];
  currentVideoUrl: string | null;
  onSelectVideo: (url: string) => void;
  onRefresh: () => void;
}

export const RecentGenerations: React.FC<RecentGenerationsProps> = ({
  recentVideos,
  currentVideoUrl,
  onSelectVideo,
  onRefresh,
}) => {
  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8' }}>
          RECENT GENERATIONS
        </Typography>
        <Tooltip title="Refresh History">
          <IconButton size="small" onClick={onRefresh} sx={{ color: '#64748b' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
        {recentVideos.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No rendered videos yet
          </Typography>
        ) : (
          recentVideos.map((vid) => (
            <Chip
              key={vid.filename}
              label={vid.filename}
              clickable
              onClick={() => onSelectVideo(vid.url)}
              variant={currentVideoUrl === vid.url ? 'filled' : 'outlined'}
              color={currentVideoUrl === vid.url ? 'primary' : 'default'}
              size="small"
              sx={{ fontSize: '0.75rem', flexShrink: 0 }}
            />
          ))
        )}
      </Stack>
    </Card>
  );
};
