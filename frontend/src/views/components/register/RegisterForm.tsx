import { Box, Button, Typography, Link, IconButton } from "@mui/material";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

type FormInputProps = {
  label: string;
  placeholder: string;
  type?: string;
  hasPasswordIcon?: boolean;
};

function FormInput({
  label,
  placeholder,
  type = "text",
  hasPasswordIcon = false,
}: FormInputProps) {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Typography
        component="label"
        sx={{
          display: "block",
          color: "#000000",
          fontWeight: 400,

          fontSize: {
            xs: "14px",
            md: "calc(18 * var(--u))",
          },

          lineHeight: 1.15,

          mb: {
            xs: "6px",
            md: "calc(7 * var(--u))",
          },
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "100%",
        }}
      >
        <Box
          component="input"
          type={type}
          placeholder={placeholder}
          sx={{
            width: "100%",

            height: {
              xs: "34px",
              md: "calc(36 * var(--u))",
            },

            minHeight: "34px",
            maxHeight: "42px",

            boxSizing: "border-box",

            border: "1px solid #9AA3AE",
            borderRadius: "6px",

            bgcolor: "#E6E6E6",
            color: "#4B5563",

            fontSize: {
              xs: "13px",
              md: "calc(14 * var(--u))",
            },

            px: {
              xs: "12px",
              md: "calc(13 * var(--u))",
            },

            pr: hasPasswordIcon ? "42px" : undefined,

            outline: "none",

            "&::placeholder": {
              color: "#657181",
              opacity: 1,
            },

            "&:focus": {
              borderColor: "#2563EB",
              boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.16)",
            },
          }}
        />

        {hasPasswordIcon && (
          <IconButton
            type="button"
            aria-label="Mostrar senha"
            sx={{
              position: "absolute",
              right: "7px",
              top: "50%",
              transform: "translateY(-50%)",
              p: "4px",
              color: "#6B7280",
            }}
          >
            <VisibilityOffOutlinedIcon
              sx={{
                fontSize: {
                  xs: "17px",
                  md: "calc(18 * var(--u))",
                },
              }}
            />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default function RegisterForm() {
  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      sx={{
        width: {
          xs: "100%",
          md: "clamp(365px, 23.3vw, 447px)",
        },

        maxWidth: {
          xs: "360px",
          md: "447px",
        },

        bgcolor: {
          xs: "#FFFFFF",
          md: "transparent",
        },

        borderRadius: {
          xs: "8px",
          md: 0,
        },

        boxShadow: {
          xs: "0 1px 10px rgba(0, 0, 0, 0.04)",
          md: "none",
        },

        px: {
          xs: "16px",
          md: 0,
        },

        py: {
          xs: "22px",
          md: 0,
        },

        boxSizing: "border-box",
      }}
    >
      <Typography
        component="h1"
        sx={{
          color: "#000000",
          textAlign: "center",
          fontWeight: 700,
          lineHeight: 1.1,

          fontSize: {
            xs: "24px",
            md: "calc(28 * var(--u))",
          },

          mb: {
            xs: "8px",
            md: "calc(14 * var(--u))",
          },
        }}
      >
        Criar conta
      </Typography>

      <Typography
        sx={{
          color: "#6F6F6F",
          textAlign: "center",
          lineHeight: 1.15,

          fontSize: {
            xs: "13px",
            md: "calc(14 * var(--u))",
          },

          mb: {
            xs: "20px",
            md: "calc(22 * var(--u))",
          },
        }}
      >
        Preencha os dados abaixo para começar a usar o Elo
        <br />
        de Cuidado
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",

          gap: {
            xs: "13px",
            md: "calc(16 * var(--u))",
          },
        }}
      >
        <FormInput label="Nome completo:" placeholder="Digite seu nome.." />

        <FormInput label="CPF:" placeholder="Digite seu CPF.." />

        <FormInput label="E-mail:" placeholder="Digite seu e-mail.." />

        <FormInput
          label="Senha:"
          placeholder="Crie uma senha forte"
          type="password"
          hasPasswordIcon
        />

        <FormInput
          label="Confirmar senha:"
          placeholder="Digite a senha novamente"
          type="password"
          hasPasswordIcon
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "22px 1fr auto 1fr",
          alignItems: "center",

          columnGap: {
            xs: "6px",
            md: "calc(9 * var(--u))",
          },

          mt: {
            xs: "14px",
            md: "calc(17 * var(--u))",
          },

          mb: {
            xs: "16px",
            md: "calc(18 * var(--u))",
          },
        }}
      >
        <Box
          component="input"
          type="checkbox"
          aria-label="Aceitar termos"
          sx={{
            appearance: "none",

            width: {
              xs: "18px",
              md: "calc(18 * var(--u))",
            },

            height: {
              xs: "18px",
              md: "calc(18 * var(--u))",
            },

            border: "1px solid #2563EB",
            borderRadius: "4px",
            bgcolor: "#FFFFFF",
            cursor: "pointer",

            "&:checked": {
              bgcolor: "#2563EB",
              backgroundImage:
                "linear-gradient(45deg, transparent 65%, white 65%), linear-gradient(-45deg, transparent 75%, white 75%), linear-gradient(45deg, white 40%, transparent 40%)",
              backgroundPosition:
                "left 6px top 9px, left 8px top 9px, left 3px top 5px",
              backgroundSize: "5px 5px, 5px 5px, 8px 8px",
              backgroundRepeat: "no-repeat",
            },
          }}
        />

        <Typography
          sx={{
            color: "#000000",
            lineHeight: 1.05,

            fontSize: {
              xs: "11px",
              md: "calc(14 * var(--u))",
            },
          }}
        >
          Li e concordo
          <br />
          com os
        </Typography>

        <Link
          href="#"
          underline="none"
          sx={{
            color: "#2B7DE9",
            lineHeight: 1.05,

            fontSize: {
              xs: "11px",
              md: "calc(14 * var(--u))",
            },
          }}
        >
          Termos de
          <br />
          Serviço.
        </Link>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: {
              xs: "6px",
              md: "calc(9 * var(--u))",
            },
          }}
        >
          <Typography
            sx={{
              color: "#000000",

              fontSize: {
                xs: "11px",
                md: "calc(14 * var(--u))",
              },
            }}
          >
            e
          </Typography>

          <Link
            href="#"
            underline="none"
            sx={{
              color: "#2B7DE9",
              lineHeight: 1.05,

              fontSize: {
                xs: "11px",
                md: "calc(14 * var(--u))",
              },
            }}
          >
            Política de
            <br />
            Privacidade.
          </Link>
        </Box>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          height: {
            xs: "37px",
            md: "calc(37 * var(--u))",
          },

          minHeight: "37px",
          maxHeight: "45px",

          bgcolor: "#2856D9",
          color: "#FFFFFF",

          borderRadius: "6px",

          fontWeight: 700,

          fontSize: {
            xs: "15px",
            md: "calc(18 * var(--u))",
          },

          lineHeight: 1,

          textTransform: "none",

          boxShadow: "3px 4px 4px rgba(0, 0, 0, 0.35)",

          "&:hover": {
            bgcolor: "#1F4ED0",
          },
        }}
      >
        Registrar
      </Button>

      <Typography
        sx={{
          textAlign: "center",
          color: "#6B7280",

          fontSize: {
            xs: "12px",
            md: "calc(14 * var(--u))",
          },

          mt: {
            xs: "17px",
            md: "calc(24 * var(--u))",
          },
        }}
      >
        Já possui uma conta?{" "}
        <Link
          href="#"
          underline="none"
          sx={{
            color: "#2B7DE9",
            fontWeight: 700,
          }}
        >
          Entrar.
        </Link>
      </Typography>
    </Box>
  );
}
