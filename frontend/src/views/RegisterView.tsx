import { Typography, Stack, Button, Box } from "@mui/material";
import AuthCard from "../components/cards/AuthCard";
import InputField from "../components/inputs/InputField";
import AccountTypeSelect from "../components/inputs/AccountTypeSelect";
import { Person, Email, Phone, Lock } from "@mui/icons-material";

export default function RegisterView() {
  return (
    <AuthCard>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Criar Conta
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Cadastre-se para acompanhar dados de saúde do seu familiar
        </Typography>
      </Box>

      <Stack spacing={3}>
        <InputField
          label="Nome completo"
          icon={<Person sx={{ color: "primary.main", mr: 1 }} />}
        />

        <InputField
          label="Email"
          type="email"
          icon={<Email sx={{ color: "primary.main", mr: 1 }} />}
        />

        <InputField
          label="Telefone"
          icon={<Phone sx={{ color: "primary.main", mr: 1 }} />}
        />

        <InputField
          label="Senha"
          type="password"
          icon={<Lock sx={{ color: "primary.main", mr: 1 }} />}
        />

        <InputField
          label="Confirmar senha"
          type="password"
          icon={<Lock sx={{ color: "primary.main", mr: 1 }} />}
        />

        <AccountTypeSelect />

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{
            height: 50,
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          Cadastrar
        </Button>
      </Stack>

      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          pt: 2,
          borderTop: "1px solid #e0e6ed"
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Já tem conta?
        </Typography>

        <Button variant="text" color="primary" size="small">
          Fazer login
        </Button>
      </Box>
    </AuthCard>
  );
}