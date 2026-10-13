import { AppBar, Toolbar, Stack, Box, Typography, Button } from '@mui/material';
import { Tune as TuneIcon } from '@mui/icons-material';
import { studioTokens } from '../theme/theme';

interface HeaderProps {
  hardware: string;
  onOpenSettings?: () => void;
}

const DeckShotLogo = () => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <rect width="32" height="32" rx="8" fill={studioTokens.bgElevated} stroke={studioTokens.borderDefault} strokeWidth="0.8" />
    {/* Back Presentation Deck Card */}
    <rect x="5" y="5" width="18" height="13" rx="2.5" fill={studioTokens.primaryLight} opacity="0.35" />
    {/* Front Video Scene Card */}
    <rect x="9" y="10" width="18" height="14" rx="2.5" fill={studioTokens.primary} />
    {/* Filmstrip slide marks */}
    <rect x="11" y="12" width="1.8" height="1.8" rx="0.5" fill="#ffffff" opacity="0.8" />
    <rect x="11" y="15.5" width="1.8" height="1.8" rx="0.5" fill="#ffffff" opacity="0.8" />
    <rect x="11" y="19" width="1.8" height="1.8" rx="0.5" fill="#ffffff" opacity="0.8" />
    {/* Cinematic Shot Play Action */}
    <path d="M16 13.5L23 17L16 20.5V13.5Z" fill="#ffffff" />
  </svg>
);

export const Header = ({ hardware, onOpenSettings }: HeaderProps) => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: studioTokens.bgPanel,
        borderBottom: `1px solid ${studioTokens.borderDefault}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2.5, md: 4 }, minHeight: 64 }}>
        <Stack direction="row" spacing={1.8} sx={{ alignItems: 'center' }}>
          <DeckShotLogo />
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: studioTokens.textPrimary }}>
                DeckShot AI
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor: studioTokens.primarySubtle,
                  color: studioTokens.primaryLight,
                  border: `1px solid ${studioTokens.primarySubtle}`,
                }}
              >
                STUDIO
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: studioTokens.textMuted, fontSize: '0.75rem', fontWeight: 500 }}>
              Local AI Video Production Studio
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {/* Hardware Acceleration Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.6,
              py: 0.6,
              borderRadius: 2,
              bgcolor: studioTokens.bgInput,
              border: `1px solid ${studioTokens.borderDefault}`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: studioTokens.success,
                boxShadow: `0 0 8px ${studioTokens.success}`,
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, color: studioTokens.textSecondary, letterSpacing: '0.02em' }}>
              {hardware}
            </Typography>
          </Box>

          {/* Engine Settings Drawer Trigger */}
          {onOpenSettings && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
              onClick={onOpenSettings}
              sx={{
                height: 34,
                px: 1.5,
                fontSize: '0.82rem',
                borderColor: studioTokens.borderDefault,
                color: studioTokens.textSecondary,
                bgcolor: studioTokens.bgInput,
                '&:hover': {
                  borderColor: studioTokens.primary,
                  color: studioTokens.textPrimary,
                  bgcolor: studioTokens.bgSubtle,
                },
              }}
            >
              Settings
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
