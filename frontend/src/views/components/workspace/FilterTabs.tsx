import { Box, Button } from "@mui/material";

interface FilterTabsProps {
  filtro: string;
  setFiltro: (item: string) => void;
}

export default function FilterTabs({
  filtro,
  setFiltro,
}: FilterTabsProps) {

  return (
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

   
  );
}