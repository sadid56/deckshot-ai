import React, { useRef } from 'react';
import { Card, Box, Typography, Stack, TextField, Chip, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Clear as ClearIcon } from '@mui/icons-material';

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
    <Card sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#f8fafc' }}>
        Reference Image (Optional)
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Upload an image for Image-to-Video, or leave empty to generate purely from text prompt (Text-to-Video).
      </Typography>


      {/* Upload Dropzone */}
      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed rgba(255,255,255,0.15)',
          borderRadius: 2.5,
          bgcolor: 'rgba(14,16,25,0.85)',
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s',
          '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.04)' },
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
              bgcolor: '#000',
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
                top: 10,
                right: 10,
                bgcolor: 'rgba(0,0,0,0.7)',
                '&:hover': { bgcolor: '#ef4444' },
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Stack spacing={1} sx={{ p: 2, alignItems: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 40, color: '#6366f1' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Click or drag & drop your reference image
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PNG, JPG, WebP supported
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Motion Prompt */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Motion & Cinematic Prompt
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3.5}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe how the camera pans, light sweeps, or product reveals..."
          sx={{ bgcolor: 'rgba(14,16,25,0.85)', borderRadius: 2 }}
        />

        {/* Prompt helper chips */}
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          {[
            { label: 'Orbit Pan', text: 'Slow 360-degree orbit around the subject, dramatic volumetric lighting.' },
            { label: 'Macro Zoom', text: 'Camera zooms slowly into high-tech details, soft glossy reflections.' },
            { label: 'Side Reveal', text: 'Cinematic side tracking shot, studio spotlight reveal.' },
          ].map((chip) => (
            <Chip
              key={chip.label}
              label={chip.label}
              size="small"
              onClick={() => onPromptChange(`${prompt.trim()} ${chip.text}`)}
              clickable
              sx={{ fontSize: '0.75rem', bgcolor: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </Stack>
      </Box>
    </Card>
  );
};
