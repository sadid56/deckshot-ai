import React from 'react';
import { Card, Box, Typography, Button, Stack, TextField, IconButton } from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutlined as DeleteIcon,
  CloudUploadOutlined as CloudUploadIcon,
} from '@mui/icons-material';
import type { SceneItem } from '../types';
import { studioTokens } from '../theme/theme';

interface MultiSceneTabProps {
  scenes: SceneItem[];
  onAddScene: () => void;
  onRemoveScene: (id: number) => void;
  onSceneImageUpload: (id: number, file: File) => void;
  onScenePromptChange: (id: number, text: string) => void;
}

export const MultiSceneTab: React.FC<MultiSceneTabProps> = ({
  scenes,
  onAddScene,
  onRemoveScene,
  onSceneImageUpload,
  onScenePromptChange,
}) => {
  return (
    <Card sx={{ p: 3, bgcolor: studioTokens.bgPanel, border: `1px solid ${studioTokens.borderDefault}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
            Storyboard Sequences ({scenes.length} Scenes)
          </Typography>
          <Typography variant="caption" sx={{ color: studioTokens.textMuted, display: 'block' }}>
            Sequentially render each scene and stitch into a master presentation video.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddScene}
          sx={{
            borderColor: studioTokens.borderDefault,
            color: studioTokens.textPrimary,
            '&:hover': { borderColor: studioTokens.primary, bgcolor: studioTokens.primarySubtle },
          }}
        >
          Add Scene
        </Button>
      </Box>

      <Stack spacing={2} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
        {scenes.map((scene, idx) => (
          <Card
            key={scene.id}
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              gap: 2,
              position: 'relative',
              bgcolor: studioTokens.bgInput,
              borderColor: studioTokens.borderDefault,
              borderRadius: 2,
            }}
          >
            {/* Thumbnail / Upload Box */}
            <Box
              component="label"
              sx={{
                width: 90,
                height: 90,
                borderRadius: 1.5,
                border: scene.imagePreview
                  ? `1px solid ${studioTokens.borderDefault}`
                  : `1px dashed ${studioTokens.borderDefault}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                bgcolor: studioTokens.bgCanvas,
                flexShrink: 0,
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: studioTokens.primary },
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && onSceneImageUpload(scene.id, e.target.files[0])}
              />
              {scene.imagePreview ? (
                <img
                  src={scene.imagePreview}
                  alt={`Scene ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Stack spacing={0.5} sx={{ alignItems: 'center', color: studioTokens.textMuted }}>
                  <CloudUploadIcon sx={{ fontSize: 22, color: studioTokens.primaryLight }} />
                  <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                    Upload
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Scene Text Input */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: studioTokens.primaryLight, display: 'block', mb: 0.5, letterSpacing: '0.02em' }}
              >
                Scene {idx + 1} {scene.file ? `(${scene.file.name})` : '(Text-to-Video)'}
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={scene.prompt}
                onChange={(e) => onScenePromptChange(scene.id, e.target.value)}
                placeholder="Describe motion for this scene..."
              />
            </Box>

            {scenes.length > 1 && (
              <IconButton
                size="small"
                onClick={() => onRemoveScene(scene.id)}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  color: studioTokens.textMuted,
                  '&:hover': { color: studioTokens.error },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Card>
        ))}
      </Stack>
    </Card>
  );
};
