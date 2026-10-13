import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import { WarningAmberRounded as WarningIcon } from "@mui/icons-material";
import { studioTokens } from "../../theme/theme";
import { Button } from "../ui";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: studioTokens.bgBackdrop,
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            bgcolor: studioTokens.bgElevated,
            backgroundImage: "none !important",
            border: `1px solid ${studioTokens.borderElevated}`,
            borderRadius: `${studioTokens.radiusLg}px`,
            boxShadow: studioTokens.shadowElevated,
            p: 1,
            minWidth: { xs: 300, sm: 400 },
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {variant === "danger" && (
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: studioTokens.dangerSubtle,
                color: studioTokens.danger,
                border: `1px solid ${studioTokens.dangerBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WarningIcon sx={{ fontSize: 20 }} />
            </Box>
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body2" sx={{ color: studioTokens.textSecondary, lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
        <Button
          variant="ghost"
          size="small"
          disabled={loading}
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          size="small"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
