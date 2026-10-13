import React from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  type SxProps,
  type Theme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { studioTokens } from "../../theme/theme";

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string | Record<string, number | string>;
  anchor?: "right" | "left";
  sx?: SxProps<Theme>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  headerExtra,
  children,
  footer,
  width = { xs: "100vw", sm: 400 },
  anchor = "right",
  sx,
}) => {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: studioTokens.bgBackdrop,
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            width,
            bgcolor: studioTokens.bgPanel,
            backgroundImage: "none !important",
            borderLeft: anchor === "right" ? `1px solid ${studioTokens.borderElevated}` : "none",
            borderRight: anchor === "left" ? `1px solid ${studioTokens.borderElevated}` : "none",
            boxShadow:
              anchor === "right"
                ? studioTokens.shadowDrawerRight
                : studioTokens.shadowDrawerLeft,
            p: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            ...sx,
          },
        },
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Stack direction='row' spacing={1.5} sx={{ alignItems: "center" }}>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: `${studioTokens.radiusSm}px`,
                bgcolor: studioTokens.primarySubtle,
                border: `1px solid ${studioTokens.primarySubtle}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: studioTokens.textPrimary, lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant='caption' sx={{ color: studioTokens.textMuted, fontSize: "0.75rem" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction='row' spacing={1} sx={{ alignItems: "center" }}>
          {headerExtra}
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
        </Stack>
      </Box>

      <Divider sx={{ borderColor: studioTokens.borderDefault, mb: 3 }} />

      {/* Sidebar Content (Scrollable if needed, without outer scrollbar) */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: studioTokens.borderDefault,
            borderRadius: `${studioTokens.radiusSm}px`,
          },
        }}
      >
        {children}
      </Box>

      {/* Sidebar Footer */}
      {footer && (
        <Box sx={{ pt: 2, mt: "auto" }}>
          <Divider sx={{ borderColor: studioTokens.borderDefault, mb: 2 }} />
          {footer}
        </Box>
      )}
    </Drawer>
  );
};
