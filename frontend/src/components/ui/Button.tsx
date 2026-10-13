import React from "react";
import {
  Button as MuiButton,
  CircularProgress,
  type ButtonProps as MuiButtonProps,
} from "@mui/material";
import { studioTokens } from "../../theme/theme";

export type ButtonVariant = "primary" | "secondary" | "outlined" | "ghost" | "danger";

export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: React.ReactNode;
  component?: React.ElementType;
  download?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  loadingText,
  disabled = false,
  startIcon,
  endIcon,
  children,
  sx,
  size = "medium",
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bgcolor: studioTokens.primary,
          color: studioTokens.bgCanvas,
          border: "1px solid transparent",
          fontWeight: 700,
          boxShadow: studioTokens.shadowPrimary,
          "&:hover": {
            bgcolor: studioTokens.primaryHover,
            color: studioTokens.bgCanvas,
            boxShadow: studioTokens.shadowPrimaryHover,
          },
          "&.Mui-disabled": {
            bgcolor: studioTokens.primaryDisabled,
            color: studioTokens.textDisabled,
            boxShadow: "none",
          },
        };

      case "secondary":
      case "outlined":
        return {
          bgcolor: studioTokens.bgPanel,
          color: studioTokens.textPrimary,
          border: `1px solid ${studioTokens.borderDefault}`,
          boxShadow: studioTokens.shadowSm,
          fontWeight: 500,
          "&:hover": {
            bgcolor: studioTokens.bgSubtle,
            borderColor: studioTokens.primaryLight,
            color: studioTokens.textPrimary,
            boxShadow: studioTokens.shadowMd,
          },
          "&.Mui-disabled": {
            bgcolor: studioTokens.bgInput,
            color: studioTokens.textDisabled,
            borderColor: studioTokens.borderDisabled,
            boxShadow: "none",
          },
        };

      case "ghost":
        return {
          bgcolor: "transparent",
          color: studioTokens.textSecondary,
          border: "1px solid transparent",
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            bgcolor: studioTokens.bgSubtle,
            color: studioTokens.textPrimary,
          },
          "&.Mui-disabled": {
            color: studioTokens.textDisabled,
          },
        };

      case "danger":
        return {
          bgcolor: studioTokens.dangerSubtle,
          color: studioTokens.danger,
          border: `1px solid ${studioTokens.dangerBorder}`,
          fontWeight: 600,
          boxShadow: studioTokens.shadowSm,
          "&:hover": {
            bgcolor: studioTokens.errorSubtle,
            borderColor: studioTokens.error,
            color: studioTokens.textPrimary,
            boxShadow: studioTokens.shadowMd,
          },
          "&.Mui-disabled": {
            bgcolor: studioTokens.bgInput,
            borderColor: studioTokens.borderDisabled,
            color: studioTokens.textDisabled,
            boxShadow: "none",
          },
        };
    }
  };

  const spinnerSize = size === "small" ? 14 : size === "large" ? 20 : 16;

  return (
    <MuiButton
      disabled={isDisabled}
      size={size}
      startIcon={loading ? <CircularProgress size={spinnerSize} color='inherit' /> : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        borderRadius: `${studioTokens.radiusMd}px`,
        textTransform: "none",
        fontSize: size === "small" ? "0.82rem" : size === "large" ? "0.98rem" : "0.88rem",
        py: size === "small" ? 0.6 : size === "large" ? 1.2 : 0.9,
        px: size === "small" ? 1.8 : size === "large" ? 3.2 : 2.4,
        transition: "all 0.18s ease-in-out",
        ...getVariantStyles(),
        ...sx,
      }}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </MuiButton>
  );
};
