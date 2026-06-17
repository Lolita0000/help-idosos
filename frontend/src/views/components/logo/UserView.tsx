import { Box, Typography, Button } from "@mui/material";
import Logo from "./Logo";

interface UserViewProps {
  onStart: () => void;
}

export default function UserView({ onStart }: UserViewProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#4A90E2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2
      }}
    >
      <Box textAlign="center">
        <Box mb={2}>
          <Logo />
        </Box>

        <Typography
          sx={{
            fontWeight: 400,
            fontSize: {
              xs: "20px",
              md: "28px"
            },
            color: "#fff",
            mb: 5
          }}
        >
          Cuidando de quem você <br />
          ama, juntos
        </Typography>

        <Button
          variant="contained"
          onClick={onStart}
          sx={{
            width: {
              xs: "80%",
              sm: "300px"
            },
            height: "70px",
            borderRadius: "50px",
            fontSize: "24px",
            fontWeight: 700,
            textTransform: "none",
            backgroundColor: "#1D4ED8"
          }}
        >
          Começar
        </Button>
      </Box>
    </Box>
  );
}