import { Box } from "@mui/material";
import AuthSidePanel from "./components/auth/AuthSidePanel";
import RegisterForm from "./components/register/RegisterForm";

type RegisterViewProps = {
  onRegister?: () => void;
};

export default function RegisterView({
  onRegister,
}: RegisterViewProps) {
  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100dvh",
        overflow: {
          xs: "auto",
          md: "hidden",
        },
        bgcolor: {
          xs: "#EAF7FF",
          md: "#FFFFFF",
        },
        position: "relative",

        "--u": {
          xs: "1px",
          md: "clamp(0.9px, calc(100dvh / 744), 1.22px)",
        },
      }}
    >
      <AuthSidePanel />

      <Box
        component="main"
        sx={{
          position: {
            xs: "relative",
            md: "absolute",
          },

          left: {
            xs: "auto",
            md: "54.7vw",
          },

          top: {
            xs: "auto",
            md: "6.45dvh",
          },

          width: {
            xs: "100%",
            md: "clamp(365px, calc(365 * var(--u)), 447px)",
          },

          maxWidth: {
            xs: "365px",
            md: "none",
          },

          mx: {
            xs: "auto",
            md: 0,
          },

          px: {
            xs: "16px",
            md: 0,
          },

          pt: {
            xs: "24px",
            md: 0,
          },

          pb: {
            xs: "32px",
            md: 0,
          },

          boxSizing: "border-box",
        }}
      >
        <RegisterForm 
          onRegister={onRegister}
        />
      </Box>
    </Box>
  );
}