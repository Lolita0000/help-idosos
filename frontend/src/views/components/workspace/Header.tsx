import { Box, Typography, Button } from "@mui/material";

export default function Header() {
  return (
    <>
      
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
    </>
  );
}