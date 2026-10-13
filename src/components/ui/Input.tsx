import React from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  type TextFieldProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import { studioTokens } from "../../theme/theme";

export interface InputProps extends Omit<TextFieldProps, "variant"> {
  label?: string;
  labelIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  headerRight?: React.ReactNode;
  containerSx?: SxProps<Theme>;
}

export const Input: React.FC<InputProps> = ({
  label,
  labelIcon,
  startIcon,
  endIcon,
  headerRight,
  containerSx,
  fullWidth = true,
  size = "small",
  placeholder,
  value,
  onChange,
  disabled,
  error,
  helperText,
  sx,
  ...rest
}) => {
  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto", ...containerSx }}>
      {(label || headerRight) && (
        <Stack
          direction='row'
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.8,
          }}
        >
          {label && (
            <Stack direction='row' spacing={1} sx={{ alignItems: "center" }}>
              {labelIcon}
              <Typography variant='body2' sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
                {label}
              </Typography>
            </Stack>
          )}
          {headerRight}
        </Stack>
      )}

      <TextField
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        helperText={helperText}
        variant='outlined'
        slotProps={{
          input: {
            startAdornment: startIcon ? <InputAdornment position='start'>{startIcon}</InputAdornment> : undefined,
            endAdornment: endIcon ? <InputAdornment position='end'>{endIcon}</InputAdornment> : undefined,
          },
        }}
        sx={{
          "& .MuiInputBase-root": {
            bgcolor: studioTokens.bgInput,
            color: studioTokens.textPrimary,
            borderRadius: `${studioTokens.radiusMd}px`,
            fontSize: "0.88rem",
            border: `1px solid ${error ? studioTokens.error : studioTokens.borderDefault}`,
            transition: "border-color 0.15s ease",
            "&:hover": {
              borderColor: error ? studioTokens.error : studioTokens.borderHover,
            },
            "&.Mui-focused": {
              borderColor: error ? studioTokens.error : studioTokens.primary,
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .MuiInputBase-input": {
            py: 1,
            "&::placeholder": {
              color: studioTokens.textMuted,
              opacity: 1,
            },
          },
          "& .MuiFormHelperText-root": {
            mx: 0.5,
            mt: 0.5,
            fontSize: "0.74rem",
            color: error ? studioTokens.error : studioTokens.textMuted,
          },
          ...sx,
        }}
        {...rest}
      />
    </Box>
  );
};
