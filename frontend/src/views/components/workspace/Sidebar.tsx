import { Box, Typography, Divider } from "@mui/material";
import Logo from "../logo/Logo";
interface SidebarProps {
  menuPrincipal: string[];
  menuSelecionado: string;
  setMenuSelecionado: (item: string) => void;
}

export default function Sidebar({
  menuPrincipal,
  menuSelecionado,
  setMenuSelecionado,
}: SidebarProps) {
  return (
    <Box
      sx={{
        width: {
          xs: 90,
          md: 260,
        },
        background: "linear-gradient(180deg,#3656F7 0%,#3454F5 100%)",
        color: "#FFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        py: 4,
      }}
    >
      <Box>
        <Box
          sx={{
            px: 2,
            mb: 4,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Logo />
        </Box>

        <Divider
          sx={{
            borderColor: "rgba(255,255,255,0.2)",
            mb: 2,
          }}
        />

        <Box sx={{ px: 2 }}>
          <Typography
            sx={{
              fontSize: 13,
              opacity: 0.7,
              mb: 1,
              px: 1,
            }}
          >
            Menu principal
          </Typography>

          {menuPrincipal.map((item) => (
            <Box
              key={item}
              onClick={() => setMenuSelecionado(item)}
              sx={{
                py: 1.5,
                px: 2,
                mb: 1,
                borderRadius: 3,
                cursor: "pointer",

                backgroundColor:
                  menuSelecionado === item ? "#5B9CFF" : "transparent",

                "&:hover": {
                  backgroundColor: "#4E89FF",
                },
              }}
            >
              <Typography>{item}</Typography>
            </Box>
          ))}

          <Typography
            sx={{
              fontSize: 13,
              opacity: 0.7,
              mt: 3,
              mb: 1,
              px: 1,
            }}
          >
            Workspaces
          </Typography>

          <Box
            onClick={() => setMenuSelecionado("Meus Workspaces")}
            sx={{
              py: 1.5,
              px: 2,
              mb: 1,
              borderRadius: 3,
              cursor: "pointer",
              backgroundColor: "#5B9CFF",

              "&:hover": {
                backgroundColor: "#4E89FF",
              },
            }}
          >
            <Typography fontWeight={700}>Meus Workspaces</Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 13,
              opacity: 0.7,
              mt: 3,
              mb: 1,
              px: 1,
            }}
          >
            Administração
          </Typography>

          <Box
            onClick={() => setMenuSelecionado("Configurações")}
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 3,
              cursor: "pointer",

              backgroundColor:
                menuSelecionado === "Configurações" ? "#5B9CFF" : "transparent",

              "&:hover": {
                backgroundColor: "#4E89FF",
              },
            }}
          >
            <Typography>Configurações</Typography>
          </Box>
        </Box>
      </Box>

      {/* USUÁRIO */}

      <Box
        sx={{
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#00C8FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          CP
        </Box>

        <Box>
          <Typography fontWeight={700}>Carlos Pereira</Typography>

          <Typography
            sx={{
              fontSize: 13,
              opacity: 0.8,
            }}
          >
            carlosp@gmail.com
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
