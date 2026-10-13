import React from "react";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import { studioTokens } from "../../theme/theme";

export type StatusType = "ready" | "running" | "warning" | "error" | "standby" | "info";

export interface StatusBadgeProps {
  status: StatusType;
  label: string;
  pulse?: boolean;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, pulse = false, size = "small", sx }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "ready":
        return {
          dotColor: studioTokens.success,
          bgColor: studioTokens.successSubtle,
          textColor: studioTokens.successText,
          borderColor: studioTokens.successBorder,
        };
      case "running":
        return {
          dotColor: studioTokens.primary,
          bgColor: studioTokens.primarySubtle,
          textColor: studioTokens.primaryLight,
          borderColor: studioTokens.primaryBorder,
        };
      case "warning":
        return {
          dotColor: studioTokens.warning,
          bgColor: studioTokens.warningSubtle,
          textColor: studioTokens.warning,
          borderColor: studioTokens.warningBorder,
        };
      case "error":
        return {
          dotColor: studioTokens.danger,
          bgColor: studioTokens.dangerSubtle,
          textColor: studioTokens.danger,
          borderColor: studioTokens.dangerBorder,
        };
      case "standby":
      case "info":
      default:
        return {
          dotColor: studioTokens.textMuted,
          bgColor: studioTokens.bgSubtle,
          textColor: studioTokens.textSecondary,
          borderColor: studioTokens.borderDefault,
        };
    }
  };

  const { dotColor, bgColor, textColor, borderColor } = getStatusStyles();

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.8,
        px: size === "small" ? 1 : 1.4,
        py: size === "small" ? 0.3 : 0.5,
        borderRadius: `${studioTokens.radiusPill}px`,
        bgcolor: bgColor,
        border: `1px solid ${borderColor}`,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: size === "small" ? 6 : 8,
          height: size === "small" ? 6 : 8,
          borderRadius: "50%",
          bgcolor: dotColor,
          flexShrink: 0,
          boxShadow: pulse ? `0 0 8px ${dotColor}` : "none",
          animation: pulse ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.35 },
          },
        }}
      />
      <Typography
        variant='caption'
        sx={{
          fontSize: size === "small" ? "0.68rem" : "0.75rem",
          fontWeight: 700,
          color: textColor,
          letterSpacing: "0.03em",
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};
