import { Card, Box, Typography, Tooltip, IconButton, Stack, Chip } from "@mui/material";
import { Refresh as RefreshIcon, MovieCreationOutlined as MovieIcon, VideoLibraryOutlined as LibraryIcon } from "@mui/icons-material";
import type { RecentVideo } from "../../types";
import { studioTokens } from "../../theme/theme";
import { EmptyState } from "../../components/common";

interface RecentGenerationsProps {
  recentVideos: RecentVideo[];
  currentVideoUrl: string | null;
  onSelectVideo: (url: string) => void;
  onRefresh: () => void;
}

export const RecentGenerations: React.FC<RecentGenerationsProps> = ({ recentVideos, currentVideoUrl, onSelectVideo, onRefresh }) => {
  return (
    <Card sx={{ p: 2.2, bgcolor: studioTokens.bgPanel, border: `1px solid ${studioTokens.borderDefault}` }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Stack direction='row' spacing={1} sx={{ alignItems: "center" }}>
          <LibraryIcon sx={{ fontSize: 16, color: studioTokens.primaryLight }} />
          <Typography
            variant='caption'
            sx={{
              fontWeight: 700,
              color: studioTokens.textSecondary,
              letterSpacing: "0.06em",
              fontSize: "0.72rem",
            }}
          >
            RECENT RENDERS ({recentVideos.length})
          </Typography>
        </Stack>
        <Tooltip title='Refresh Assets'>
          <IconButton size='small' onClick={onRefresh} sx={{ color: studioTokens.textMuted }}>
            <RefreshIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack direction='row' spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
        {recentVideos.length === 0 ? (
          <EmptyState compact title='No rendered videos in session yet' />
        ) : (
          recentVideos.map((vid) => (
            <Chip
              key={vid.filename}
              icon={<MovieIcon sx={{ fontSize: 14 }} />}
              label={vid.filename}
              clickable
              onClick={() => onSelectVideo(vid.url)}
              size='small'
              sx={{
                fontSize: "0.75rem",
                flexShrink: 0,
                bgcolor: currentVideoUrl === vid.url ? studioTokens.bgElevated : studioTokens.bgInput,
                color: currentVideoUrl === vid.url ? studioTokens.primaryLight : studioTokens.textSecondary,
                border: currentVideoUrl === vid.url ? `1px solid ${studioTokens.primary}` : `1px solid ${studioTokens.borderDefault}`,
                "&:hover": {
                  bgcolor: studioTokens.bgSubtle,
                },
              }}
            />
          ))
        )}
      </Stack>
    </Card>
  );
};
