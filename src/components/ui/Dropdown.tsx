import React from "react";
import {
  Box,
  Stack,
  Typography,
  Select,
  MenuItem,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
} from "@mui/material";
import { studioTokens } from "../../theme/theme";

export interface DropdownOption<T = string | number> {
  value: T;
  label: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  label?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  truncate?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  disabled?: boolean;
  headerRight?: React.ReactNode;
  renderValue?: (value: T) => React.ReactNode;
  menuWidth?: number | string | Record<string, number | string>;
  sx?: SxProps<Theme>;
}

export function Dropdown<T extends string | number = string>({
  value,
  onChange,
  options,
  label,
  icon,
  placeholder,
  truncate = true,
  fullWidth = true,
  size = "small",
  disabled = false,
  headerRight,
  renderValue,
  menuWidth = { xs: "calc(100vw - 48px)", sm: 352 },
  sx,
}: DropdownProps<T>) {
  const handleChange = (e: SelectChangeEvent<any>) => {
    onChange(e.target.value as T);
  };

  const defaultRenderValue = (selectedVal: any) => {
    const selectedOption = options.find((opt) => opt.value === selectedVal);
    if (!selectedOption) {
      return (
        <Typography variant='body2' sx={{ color: studioTokens.textMuted }}>
          {placeholder || "Select..."}
        </Typography>
      );
    }

    if (truncate) {
      return (
        <Typography
          noWrap
          sx={{
            fontSize: "0.86rem",
            fontWeight: 500,
            color: studioTokens.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          {selectedOption.label}
        </Typography>
      );
    }

    return selectedOption.label;
  };

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
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
              {icon}
              <Typography variant='body2' sx={{ fontWeight: 700, color: studioTokens.textPrimary }}>
                {label}
              </Typography>
            </Stack>
          )}
          {headerRight}
        </Stack>
      )}

      <Select
        fullWidth={fullWidth}
        size={size}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        renderValue={renderValue || defaultRenderValue}
        MenuProps={{
          anchorOrigin: { vertical: "bottom", horizontal: "left" },
          transformOrigin: { vertical: "top", horizontal: "left" },
          slotProps: {
            paper: {
              sx: {
                width: menuWidth,
                boxSizing: "border-box",
                bgcolor: `${studioTokens.bgElevated} !important`,
                backgroundImage: "none !important",
                border: `1px solid ${studioTokens.borderElevated} !important`,
                boxShadow: `${studioTokens.shadowPopover}, 0 0 0 1px ${studioTokens.borderDefault} !important`,
                borderRadius: `${studioTokens.radiusLg}px !important`,
                mt: 0.6,
                p: 0.5,
              },
            },
          },
        }}
        sx={{
          bgcolor: studioTokens.bgInput,
          color: studioTokens.textPrimary,
          borderRadius: `${studioTokens.radiusMd}px`,
          fontSize: "0.88rem",
          border: `1px solid ${studioTokens.borderDefault}`,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "&:hover": { borderColor: studioTokens.borderHover },
          "&.Mui-focused": { borderColor: studioTokens.primary },
          "& .MuiSelect-select": {
            py: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
          ...sx,
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={option.value as any}
            disabled={option.disabled}
            sx={{
              fontSize: "0.85rem",
              py: option.subtitle ? 1 : 0.8,
              borderRadius: `${studioTokens.radiusSm}px`,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              "&:hover": {
                bgcolor: studioTokens.bgSubtle,
              },
              "&.Mui-selected": {
                bgcolor: `${studioTokens.primarySubtle} !important`,
                color: `${studioTokens.primaryLight} !important`,
                "&:hover": {
                  bgcolor: `${studioTokens.primarySubtle} !important`,
                },
              },
            }}
          >
            <Stack direction='row' spacing={1} sx={{ alignItems: "center", width: "100%" }}>
              {option.icon}
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <Typography
                  noWrap={truncate}
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: studioTokens.textPrimary,
                    overflow: truncate ? "hidden" : "visible",
                    textOverflow: truncate ? "ellipsis" : "clip",
                    whiteSpace: truncate ? "nowrap" : "normal",
                    display: "block",
                  }}
                >
                  {option.label}
                </Typography>
                {option.subtitle && (
                  <Typography
                    variant='caption'
                    noWrap={truncate}
                    sx={{
                      color: studioTokens.textMuted,
                      display: "block",
                      fontSize: "0.72rem",
                      overflow: truncate ? "hidden" : "visible",
                      textOverflow: truncate ? "ellipsis" : "clip",
                      whiteSpace: truncate ? "nowrap" : "normal",
                    }}
                  >
                    {option.subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
