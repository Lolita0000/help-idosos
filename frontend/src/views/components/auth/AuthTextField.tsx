import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";

type AuthTextFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
};

export default function AuthTextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePasswordVisibility,
}: AuthTextFieldProps) {
  const inputType = showPasswordToggle
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        component="label"
        htmlFor={id}
        sx={{
          display: "block",
          fontSize: {
            xs: 13,
            md: 18,
          },
          fontWeight: 500,
          color: "#111111",
          mb: 0.5,
        }}
      >
        {label}
      </Box>

      <TextField
        id={id}
        fullWidth
        value={value}
        type={inputType}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: showPasswordToggle ? (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                size="small"
                type="button"
                onClick={onTogglePasswordVisibility}
                aria-label={
                  isPasswordVisible ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {isPasswordVisible ? (
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: {
              xs: 32,
              md: 36,
            },
            backgroundColor: "#e8e8e8",
            borderRadius: "6px",

            "& fieldset": {
              borderColor: "#9ca3af",
            },

            "&:hover fieldset": {
              borderColor: "#6b7280",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#2955D9",
            },
          },

          "& input": {
            fontSize: {
              xs: 12,
              md: 15,
            },
            color: "#111111",
          },

          "& input::placeholder": {
            color: "#6b7280",
            opacity: 1,
          },
        }}
      />
    </Box>
  );
}
