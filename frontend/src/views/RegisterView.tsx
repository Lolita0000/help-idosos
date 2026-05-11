import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

export default function RegisterView() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "50%",
          position: "relative",
          background: "linear-gradient(160deg, #5BA4F5 0%, #2454DA 75%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 6,
          borderTopRightRadius: "55%",
          borderBottomRightRadius: "55%",
        }}
      >
        <Box sx={{ maxWidth: 420, zIndex: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 6,
            }}
          >
            <Typography
              sx={{
                fontSize: 54,
                lineHeight: 1,
              }}
            >
              ♡
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              Elo de
              <br />
              Cuidado
            </Typography>
          </Box>

          <Typography
            component="h2"
            sx={{
              fontSize: 27,
              fontWeight: 700,
              textAlign: "center",
              mb: 4,
            }}
          >
            Junte-se à nossa comunidade
            <br />
            de cuidado
          </Typography>

          <Typography
            sx={{
              fontSize: 18,
              textAlign: "center",
              mb: 4,
              lineHeight: 1.2,
            }}
          >
            Milhares de famílias já usam o Elo de Cuidado para manter todos
            informados sobre a saúde de seus entes queridos.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <BenefitItem text="Registre medicações e sintomas" />
            <BenefitItem text="Compartilhe com toda família" />
            <BenefitItem text="Gere relatórios para médicos" />
            <BenefitItem text="Dados seguros e privados (LGPD)" />
          </Box>
        </Box>

        <Box
          sx={{
            position: "absolute",
            width: 255,
            height: 255,
            borderRadius: "50%",
            backgroundColor: "rgba(91, 164, 245, 0.45)",
            left: -80,
            bottom: -80,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 135,
            height: 135,
            borderRadius: "50%",
            backgroundColor: "rgba(91, 164, 245, 0.75)",
            right: 90,
            bottom: 38,
          }}
        />
      </Box>

      <Box
        sx={{
          width: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
        }}
      >
        <Box
          component="form"
          sx={{
            width: "100%",
            maxWidth: 365,
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: 27,
              fontWeight: 700,
              textAlign: "center",
              color: "#111111",
              mb: 1.5,
            }}
          >
            Criar conta
          </Typography>

          <Typography
            sx={{
              fontSize: 15,
              color: "#777777",
              textAlign: "center",
              lineHeight: 1.2,
              mb: 2.5,
            }}
          >
            Preencha os dados abaixo para começar a usar o Elo de Cuidado
          </Typography>

          <FormField label="Nome completo:" placeholder="Digite seu nome.." />

          <FormField label="CPF:" placeholder="Digite seu CPF.." />

          <FormField label="E-mail:" placeholder="Digite seu e-mail.." />

          <FormField
            label="Senha:"
            placeholder="Crie uma senha forte"
            type="password"
            showPasswordIcon
          />

          <FormField
            label="Confirmar senha:"
            placeholder="Digite a senha novamente"
            type="password"
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 1.5,
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    color: "#2F6FED",
                    p: 0.5,
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: 15,
                    color: "#111111",
                    lineHeight: 1.1,
                  }}
                >
                  Li e concordo
                  <br />
                  com os
                </Typography>
              }
            />

            <Typography sx={{ fontSize: 15, color: "#111111" }}>
              <Link href="#" underline="none">
                Termos de Serviço
              </Link>
              {" e "}
              <Link href="#" underline="none">
                Política de Privacidade.
              </Link>
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              height: 36,
              backgroundColor: "#2955D9",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "6px",
              boxShadow: "2px 3px 4px rgba(0, 0, 0, 0.35)",
              "&:hover": {
                backgroundColor: "#1f46bd",
              },
            }}
          >
            Registrar
          </Button>

          <Typography
            sx={{
              mt: 2.5,
              textAlign: "center",
              color: "#6b7280",
              fontSize: 15,
            }}
          >
            Já possui uma conta?{" "}
            <Link href="#" underline="none" sx={{ fontWeight: 700 }}>
              Entrar.
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

type BenefitItemProps = {
  text: string;
};

function BenefitItem({ text }: BenefitItemProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />

      <Typography sx={{ fontSize: 18 }}>{text}</Typography>
    </Box>
  );
}

type FormFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  showPasswordIcon?: boolean;
};

function FormField({
  label,
  placeholder,
  type = "text",
  showPasswordIcon = false,
}: FormFieldProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        component="label"
        sx={{
          display: "block",
          fontSize: 18,
          fontWeight: 500,
          color: "#111111",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <TextField
        fullWidth
        type={type}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: showPasswordIcon ? (
            <IconButton edge="end" size="small">
              <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          ) : undefined,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: 36,
            backgroundColor: "#e8e8e8",
            borderRadius: "6px",

            "& fieldset": {
              borderColor: "#9ca3af",
            },

            "&:hover fieldset": {
              borderColor: "#6b7280",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#2955D9",
            },
          },

          "& input": {
            fontSize: 15,
            color: "#111111",
          },

          "& input::placeholder": {
            color: "#6b7280",
            opacity: 1,
          },
        }}
      />
    </Box>
  );
}
