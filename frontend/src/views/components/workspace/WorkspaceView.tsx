import { Box, Divider } from "@mui/material";
import WorkspaceCard from "./WorkspaceCard";
import Header from "./Header";
import FilterTabs from "./FilterTabs";
import Sidebar from "./Sidebar";
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
      <Sidebar
        menuPrincipal={menuPrincipal}
        menuSelecionado={menuSelecionado}
        setMenuSelecionado={setMenuSelecionado}
      />
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
        <Header />
        <Divider sx={{ mb: 3 }} />
        <FilterTabs filtro={filtro} setFiltro={setFiltro} />

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
