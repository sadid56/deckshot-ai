import React, { useRef } from 'react';
import { Card, Box, Typography, Stack, TextField, IconButton } from '@mui/material';
import {
  CloudUploadOutlined as CloudUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { studioTokens } from '../theme/theme';

interface SingleSceneTabProps {
  imageFile: File | null;
  imagePreview: string;
  prompt: string;
  onImageSelected: (file: File) => void;
  onImageCleared: () => void;
  onPromptChange: (val: string) => void;
}

export const SingleSceneTab: React.FC<SingleSceneTabProps> = ({
  imagePreview,
  prompt,
  onImageSelected,
  onImageCleared,
  onPromptChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card sx={{ p: 3, bgcolor: studioTokens.bgPanel, border: `1px solid ${studioTokens.borderDefault}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
            Reference Image
          </Typography>
          <Typography variant="caption" sx={{ color: studioTokens.textMuted, display: 'block' }}>
            Upload an image to animate (Image-to-Video) or leave empty for direct prompt (Text-to-Video).
          </Typography>
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.2,
            borderRadius: 1,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: studioTokens.bgSubtle,
            color: studioTokens.textSecondary,
            border: `1px solid ${studioTokens.borderDefault}`,
          }}
        >
          OPTIONAL
        </Box>
      </Box>

      {/* Upload Dropzone */}
      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        sx={{
          border: `1px dashed ${studioTokens.borderDefault}`,
          borderRadius: 2,
          bgcolor: studioTokens.bgInput,
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: studioTokens.primary,
            bgcolor: studioTokens.bgSubtle,
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && onImageSelected(e.target.files[0])}
        />

        {imagePreview ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 220,
              bgcolor: studioTokens.bgInput,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={imagePreview}
              alt="Reference Preview"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onImageCleared();
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.75)',
                color: studioTokens.textPrimary,
                border: `1px solid ${studioTokens.borderDefault}`,
                '&:hover': { bgcolor: studioTokens.error },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Stack spacing={1.2} sx={{ p: 3, alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: studioTokens.bgElevated,
                border: `1px solid ${studioTokens.borderDefault}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 24, color: studioTokens.primaryLight }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: studioTokens.textPrimary }}>
              Drag & drop image here or click to browse
            </Typography>
            <Typography variant="caption" sx={{ color: studioTokens.textMuted, fontSize: '0.75rem' }}>
              PNG, JPG, WebP • Generates Text-to-Video if omitted
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Motion & Video Prompt */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: studioTokens.textPrimary }}>
          Motion & Video Prompt
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3.5}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe how the camera pans, light sweeps, or product reveals..."
          variant="outlined"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '0.92rem',
              lineHeight: 1.6,
              bgcolor: studioTokens.bgInput,
            },
          }}
        />
      </Box>
    </Card>
  );
};
