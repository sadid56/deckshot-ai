import React from "react";
import { Box, Button, Stack, type SxProps, type Theme } from "@mui/material";
import { studioTokens } from "../../theme/theme";

export interface TabItem<T = any> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  items: TabItem<T>[];
  rightElement?: React.ReactNode;
  containerSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
}

export function Tabs<T = any>({
  value,
  onChange,
  items,
  rightElement,
  containerSx,
  sx,
}: TabsProps<T>) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2,
        ...containerSx,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          p: 0.5,
          borderRadius: `${studioTokens.radiusLg}px`,
          bgcolor: studioTokens.bgPanel,
          border: `1px solid ${studioTokens.borderDefault}`,
          width: { xs: "100%", sm: "auto" },
          ...sx,
        }}
      >
        {items.map((item) => {
          const isActive = item.value === value;
          return (
            <Button
              key={String(item.value)}
              disabled={item.disabled}
              onClick={() => onChange(item.value)}
              startIcon={item.icon}
              sx={{
                flex: { xs: 1, sm: "initial" },
                px: { xs: 1.5, sm: 2.5 },
                py: 0.8,
                borderRadius: `${studioTokens.radiusMd}px`,
                fontWeight: 600,
                fontSize: "0.88rem",
                color: isActive ? studioTokens.textPrimary : studioTokens.textMuted,
                bgcolor: isActive ? studioTokens.bgElevated : "transparent",
                border: isActive ? `1px solid ${studioTokens.borderDefault}` : "1px solid transparent",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: isActive ? studioTokens.bgElevated : studioTokens.bgSubtle,
                  color: studioTokens.textPrimary,
                },
              }}
            >
              <Stack direction='row' spacing={1} sx={{ alignItems: "center" }}>
                <span>{item.label}</span>
                {item.badge}
              </Stack>
            </Button>
          );
        })}
      </Box>

      {rightElement && (
        <Box sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
          {rightElement}
        </Box>
      )}
    </Box>
  );
}
