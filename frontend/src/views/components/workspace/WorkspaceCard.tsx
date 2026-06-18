import { Card, Box, Typography, Chip, Button } from "@mui/material";
import type { Workspace } from "../../../models/Workspace";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export default function WorkspaceCard({
  workspace,
}: WorkspaceCardProps) {
  return (
    <Card>
      { <Card
              sx={{
                p: 3,
                borderRadius: "12px",
                backgroundColor: "#FFF",
                border: "1px solid #4FC3F7",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "#1F2937",
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: 1.2,
                  }}
                >
                  {workspace.nome}
                </Typography>

                <Chip
                  label={workspace.papel}
                  sx={{
                    backgroundColor:
                      workspace.papel === "Admin" ? "#8FE0AE" : "#FFE58A",

                    color: workspace.papel === "Admin" ? "#1E7A45" : "#9A6B00",

                    fontWeight: 500,
                    height: 26,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  color: "#9CA3AF",
                  fontSize: "14px",
                  mt: 1,
                }}
              >
                Criado por {workspace.criador}
              </Typography>

              <Typography
                sx={{
                  mt: 4,
                  minHeight: 60,
                  color: "#374151",
                  fontSize: "15px",
                  lineHeight: 1.4,
                }}
              >
                {workspace.descricao}
              </Typography>

              <Typography
                sx={{
                  color: "#6B7280",
                  fontSize: "14px",
                }}
              >
                Pessoa: {workspace.pessoaAcompanhada}
              </Typography>

              <Typography
                sx={{
                  color: "#6B7280",
                  fontSize: "14px",
                }}
              >
                👥 {workspace.quantidadeMembros} membros
              </Typography>

              <Typography
                sx={{
                  color: "#6B7280",
                  fontSize: "14px",
                }}
              >
                📅 {workspace.dataCriacao}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  textTransform: "none",
                }}
                onClick={() => alert(`Abrindo ${workspace.nome}`)}
              >
                Acessar Workspace
              </Button>
            </Card>}
    </Card>
  );
}