import { Box } from "@mui/material";
import AuthSidePanel from "./components/auth/AuthSidePanel";
import RegisterForm from "./components/register/RegisterForm";

export default function RegisterView() {
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

        /*
          Escala vertical baseada no Figma:
          altura do protótipo = 744px.
          Usamos para manter tamanho de fontes, inputs e espaçamentos.
        */
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

          /*
            No Figma, o formulário começa mais ou menos depois da metade.
            572px / 1045px = 54.7vw
          */
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
        <RegisterForm />
      </Box>
    </Box>
  );
}
