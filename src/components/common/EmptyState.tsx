import React from "react";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import { studioTokens } from "../../theme/theme";
import { Button } from "../ui";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  compact?: boolean;
  sx?: SxProps<Theme>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  compact = false,
  sx,
}) => {
  if (compact) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1,
          px: 1.5,
          color: studioTokens.textMuted,
          ...sx,
        }}
      >
        {icon && (
          <Box sx={{ color: studioTokens.textMuted, display: "flex", alignItems: "center" }}>
            {icon}
          </Box>
        )}
        <Typography variant="caption" sx={{ color: studioTokens.textMuted, fontStyle: "italic" }}>
          {title}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        borderRadius: `${studioTokens.radiusMd}px`,
        bgcolor: studioTokens.bgInput,
        border: `1px dashed ${studioTokens.borderDefault}`,
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: studioTokens.bgElevated,
            border: `1px solid ${studioTokens.borderDefault}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
            color: studioTokens.textMuted,
            boxShadow: studioTokens.shadowSm,
          }}
        >
          {icon}
        </Box>
      )}

      <Typography variant="body2" sx={{ fontWeight: 600, color: studioTokens.textPrimary, mb: 0.5 }}>
        {title}
      </Typography>

      {description && (
        <Typography
          variant="caption"
          sx={{
            color: studioTokens.textMuted,
            maxWidth: 320,
            lineHeight: 1.5,
            mb: actionText ? 2 : 0,
          }}
        >
          {description}
        </Typography>
      )}

      {actionText && onAction && (
        <Button variant="secondary" size="small" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
