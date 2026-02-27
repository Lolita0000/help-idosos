import { Button, TextField, Box, Typography } from "@mui/material";

export default function UserView() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Cadastro de Usuário</Typography>

      <TextField
        label="Nome"
        fullWidth
        sx={{ mt: 2 }}
      />

      <TextField
        label="Telefone"
        fullWidth
        sx={{ mt: 2 }}
      />

      <Button variant="contained" sx={{ mt: 2 }}>
        Cadastrar
      </Button>
    </Box>
  );
}