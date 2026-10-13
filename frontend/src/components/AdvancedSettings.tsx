import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { GenerationSettings } from '../types';


interface AdvancedSettingsProps {
  settings: GenerationSettings;
  onUpdate: (key: keyof GenerationSettings, value: any) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Accordion
      sx={{
        bgcolor: 'rgba(14, 16, 25, 0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px !important',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#cbd5e1' }}>
          ⚙️ Advanced Parameters & Model Selection
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>AI Video Engine</InputLabel>
              <Select
                value={settings.model}
                label="AI Video Engine"
                onChange={(e) => onUpdate('model', e.target.value)}
              >
                <MenuItem value="ltx">Lightricks/LTX-Video (25 FPS - Recommended)</MenuItem>
                <MenuItem value="cogvideox">THUDM/CogVideoX-5B-I2V (Cloud GPU)</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Duration & Frames</InputLabel>
              <Select
                value={settings.frames}
                label="Duration & Frames"
                onChange={(e) => onUpdate('frames', Number(e.target.value))}
              >
                <MenuItem value={49}>49 Frames (~2.0 sec)</MenuItem>
                <MenuItem value={81}>81 Frames (~3.2 sec)</MenuItem>
                <MenuItem value={121}>121 Frames (~4.8 sec)</MenuItem>
                <MenuItem value={161}>161 Frames (~6.4 sec)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Inference Denoising Steps
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#818cf8' }}>
                {settings.steps}
              </Typography>
            </Box>
            <Slider
              value={settings.steps}
              min={15}
              max={50}
              onChange={(_, val) => onUpdate('steps', val as number)}
              size="small"
              sx={{ color: '#6366f1' }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
            <TextField
              label="Playback FPS"
              size="small"
              type="number"
              value={settings.fps}
              onChange={(e) => onUpdate('fps', Number(e.target.value))}
            />
            <TextField
              label="Negative Prompt"
              size="small"
              value={settings.negativePrompt}
              onChange={(e) => onUpdate('negativePrompt', e.target.value)}
            />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
