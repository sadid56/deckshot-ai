import React from "react";
import { Card, Box, Typography } from "@mui/material";
import { studioTokens } from "../../theme/theme";
import { Textarea } from "../../components/ui";
import { ImageDropzone } from "../../components/common";

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
  return (
    <Card sx={{ p: 3, bgcolor: studioTokens.bgPanel, border: `1px solid ${studioTokens.borderDefault}` }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
            Reference Image
          </Typography>
          <Typography variant="caption" sx={{ color: studioTokens.textMuted, display: "block" }}>
            Upload an image to animate (Image-to-Video) or leave empty for direct prompt (Text-to-Video).
          </Typography>
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.2,
            borderRadius: `${studioTokens.radiusSm}px`,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: studioTokens.bgSubtle,
            color: studioTokens.textSecondary,
            border: `1px solid ${studioTokens.borderDefault}`,
          }}
        >
          OPTIONAL
        </Box>
      </Box>

      {/* Reusable Image Dropzone */}
      <ImageDropzone
        imagePreview={imagePreview}
        onImageSelected={onImageSelected}
        onImageCleared={onImageCleared}
        height={210}
      />

      {/* Motion & Video Prompt */}
      <Textarea
        label="Motion & Video Prompt"
        rows={3.5}
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Describe how the camera pans, light sweeps, or product reveals..."
        containerSx={{ mt: 3 }}
      />
    </Card>
  );
};
