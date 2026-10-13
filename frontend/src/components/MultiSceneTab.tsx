import { Card, Box, Typography, Button, Stack, TextField, IconButton } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import type { SceneItem } from '../types';




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
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Storyboard Sequences ({scenes.length} Scenes)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload an image for each scene. Each slide animates and stitches into a complete video.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={onAddScene}
          sx={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          + Add Scene
        </Button>
      </Box>

      <Stack spacing={2} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
        {scenes.map((scene, idx) => (
          <Card
            key={scene.id}
            variant="outlined"
            sx={{ p: 1.5, display: 'flex', gap: 2, position: 'relative', bgcolor: 'rgba(14,16,25,0.6)' }}
          >
            {/* Thumbnail / Upload Box */}
            <Box
              component="label"
              sx={{
                width: 90,
                height: 90,
                borderRadius: 2,
                border: scene.imagePreview ? '1px solid rgba(255,255,255,0.2)' : '1px dashed rgba(255,255,255,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                bgcolor: '#000',
                flexShrink: 0,
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#6366f1' },
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
                <Stack spacing={0.5} sx={{ alignItems: 'center', color: '#94a3b8' }}>
                  <CloudUploadIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    + Upload
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Scene Text Input */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#818cf8', display: 'block', mb: 0.5 }}>
                Scene {idx + 1} {scene.file ? `(${scene.file.name})` : '(No image selected)'}
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={scene.prompt}
                onChange={(e) => onScenePromptChange(scene.id, e.target.value)}
                placeholder="Describe motion for this scene..."
                sx={{ bgcolor: 'rgba(0,0,0,0.3)', '& .MuiInputBase-input': { fontSize: '0.82rem' } }}
              />
            </Box>

            {scenes.length > 1 && (
              <IconButton
                size="small"
                onClick={() => onRemoveScene(scene.id)}
                sx={{ position: 'absolute', top: 4, right: 4, color: '#64748b', '&:hover': { color: '#ef4444' } }}
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
