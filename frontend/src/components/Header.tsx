import { AppBar, Toolbar, Stack, Box, Typography, Chip } from '@mui/material';
import { Movie as MovieIcon, Memory as MemoryIcon } from '@mui/icons-material';

interface HeaderProps {
  hardware: string;
}

export const Header = ({ hardware }: HeaderProps) => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(8, 9, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(99,102,241,0.5)',
            }}
          >
            <MovieIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              DeckShot AI
            </Typography>
            <Chip
              label="PRO LOCAL ENGINE"
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 18,
                bgcolor: 'rgba(99,102,241,0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            />
          </Box>

        </Stack>

        <Chip
          icon={<MemoryIcon fontSize="small" sx={{ color: '#10b981 !important' }} />}
          label={hardware}
          sx={{
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontWeight: 600,
            color: '#94a3b8',
          }}
        />
      </Toolbar>
    </AppBar>
  );
};
