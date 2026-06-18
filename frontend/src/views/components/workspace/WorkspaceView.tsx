import { Box, Typography, Button, Card, Chip, Divider } from "@mui/material";

import WorkspaceCard from "./WorkspaceCard";

import Logo from "../logo/Logo";

import { useEffect, useState } from "react";

import { listarWorkspaces } from "../../../controllers/workspaceController";
import type { Workspace } from "../../../models/Workspace";

export default function WorkspaceView() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [menuSelecionado, setMenuSelecionado] = useState("Meus Workspaces");

  useEffect(() => {
    listarWorkspaces().then(setWorkspaces);
  }, []);

  const workspacesFiltrados =
    filtro === "Todos"
      ? workspaces
      : workspaces.filter((workspace) => workspace.papel === filtro);

  const menuPrincipal = [
    "Dashboard",
    "Diário de Cuidados",
    "Membros",
    "Convites",
    "Relatórios",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        backgroundColor: "#EEF3FA",
      }}
    >
      {/* SIDEBAR */}

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
                  menuSelecionado === "Configurações"
                    ? "#5B9CFF"
                    : "transparent",

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

      {/* CONTEÚDO */}

      <Box
        sx={{
          flex: 1,
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#111827",
                fontWeight: 700,
              }}
            >
              Meus Workspaces
            </Typography>

            <Typography
              sx={{
                color: "#6B7280",
              }}
            >
              Gerencie seus núcleos de cuidado e acompanhe a saúde de pessoas
              queridas
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              sx={{
                textTransform: "none",
              }}
              onClick={() => alert("Entrar com código")}
            >
              Entrar com Código
            </Button>

            <Button
              variant="contained"
              sx={{
                textTransform: "none",
              }}
              onClick={() => alert("Criar Workspace")}
            >
              Criar novo workspace
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* FILTROS */}

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          {["Todos", "Admin", "Membro"].map((item) => (
            <Button
              key={item}
              variant={filtro === item ? "contained" : "outlined"}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
              }}
              onClick={() => setFiltro(item)}
            >
              {item}
            </Button>
          ))}
        </Box>

        {workspacesFiltrados.length === 0 && (
          <Typography>Nenhum workspace encontrado.</Typography>
        )}

        {/* CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2,1fr)",
              lg: "repeat(3,1fr)",
            },
            gap: 3,
          }}
        >
          {workspacesFiltrados.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
