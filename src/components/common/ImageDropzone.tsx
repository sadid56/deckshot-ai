import React, { useRef, useState } from "react";
import { Box, Stack, Typography, IconButton, type SxProps, type Theme } from "@mui/material";
import {
  CloudUploadOutlined as CloudUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { studioTokens } from "../../theme/theme";

export interface ImageDropzoneProps {
  imagePreview?: string | null;
  onImageSelected: (file: File) => void;
  onImageCleared?: () => void;
  title?: string;
  subtitle?: string;
  height?: number | string;
  accept?: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  imagePreview,
  onImageSelected,
  onImageCleared,
  title = "Drag & drop image here or click to browse",
  subtitle = "PNG, JPG, WebP • Generates Text-to-Video if omitted",
  height = 190,
  accept = "image/*",
  disabled = false,
  sx,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageCleared) onImageCleared();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Box
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        border: isDragOver
          ? `1px dashed ${studioTokens.primary}`
          : `1px dashed ${studioTokens.borderDefault}`,
        borderRadius: `${studioTokens.radiusMd}px`,
        bgcolor: isDragOver ? studioTokens.primarySubtle : studioTokens.bgInput,
        minHeight: height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: disabled ? studioTokens.borderDefault : studioTokens.borderHover,
          bgcolor: disabled ? studioTokens.bgInput : studioTokens.bgSubtle,
        },
        ...sx,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        disabled={disabled}
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: studioTokens.bgInput,
          }}
        >
          <img
            src={imagePreview}
            alt="Reference Preview"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
          {onImageCleared && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: studioTokens.bgOverlay,
                color: studioTokens.textPrimary,
                border: `1px solid ${studioTokens.borderDefault}`,
                borderRadius: `${studioTokens.radiusSm}px`,
                "&:hover": {
                  bgcolor: studioTokens.error,
                  color: studioTokens.bgBlack,
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ) : (
        <Stack spacing={1.2} sx={{ p: 3, alignItems: "center", textAlign: "center" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: studioTokens.bgElevated,
              border: `1px solid ${studioTokens.borderDefault}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: studioTokens.shadowSm,
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 24, color: studioTokens.primaryLight }} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: studioTokens.textPrimary }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: studioTokens.textMuted, fontSize: "0.75rem" }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
};
