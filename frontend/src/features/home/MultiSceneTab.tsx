import React, { useState } from 'react';
import { Card, Box, Typography, Stack, IconButton } from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutlined as DeleteIcon,
  CloudUploadOutlined as CloudUploadIcon,
  MovieFilterOutlined as EmptyStoryboardIcon,
} from '@mui/icons-material';
import type { SceneItem } from '../../types';
import { studioTokens } from '../../theme/theme';
import { Textarea, Button } from '../../components/ui';
import { ConfirmDialog, EmptyState } from '../../components/common';

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
  const [deleteSceneId, setDeleteSceneId] = useState<number | null>(null);

  const handleDeleteRequest = (id: number) => {
    const target = scenes.find((s) => s.id === id);
    if (target && (target.prompt.trim() || target.imagePreview)) {
      setDeleteSceneId(id);
    } else {
      onRemoveScene(id);
    }
  };

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
          variant="secondary"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddScene}
        >
          Add Scene
        </Button>
      </Box>

      {scenes.length === 0 ? (
        <EmptyState
          icon={<EmptyStoryboardIcon sx={{ fontSize: 24, color: studioTokens.primaryLight }} />}
          title="No Storyboard Scenes"
          description="Create your first scene to start crafting your video storyboard sequence."
          actionText="Add Scene"
          onAction={onAddScene}
        />
      ) : (
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
                borderRadius: `${studioTokens.radiusMd}px`,
              }}
            >
              {/* Thumbnail / Upload Box */}
              <Box
                component="label"
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: `${studioTokens.radiusSm}px`,
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
                <Textarea
                  rows={2}
                  value={scene.prompt}
                  onChange={(e) => onScenePromptChange(scene.id, e.target.value)}
                  placeholder="Describe motion for this scene..."
                />
              </Box>

              {scenes.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => handleDeleteRequest(scene.id)}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    color: studioTokens.textMuted,
                    borderRadius: `${studioTokens.radiusSm}px`,
                    '&:hover': { color: studioTokens.error },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Card>
          ))}
        </Stack>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteSceneId !== null}
        title="Delete Scene"
        message="Are you sure you want to remove this scene from your storyboard? Any prompt description and uploaded image will be permanently lost."
        confirmLabel="Delete Scene"
        variant="danger"
        onConfirm={() => {
          if (deleteSceneId !== null) {
            onRemoveScene(deleteSceneId);
            setDeleteSceneId(null);
          }
        }}
        onClose={() => setDeleteSceneId(null)}
      />
    </Card>
  );
};
