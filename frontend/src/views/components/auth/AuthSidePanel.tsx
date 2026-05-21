import { Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Logo from "../logo/Logo";

const benefits = [
  "Registre medicações e sintomas",
  "Compartilhe com toda família",
  "Gere relatórios para médicos",
  "Dados seguros e privados (LGPD)",
];

export default function AuthSidePanel() {
  return (
    <Box
      component="aside"
      sx={{
        position: {
          xs: "relative",
          md: "absolute",
        },

        left: 0,
        top: 0,

        width: {
          xs: "100%",
          md: "52vw",
        },

        height: {
          xs: "410px",
          md: "100dvh",
        },

        overflow: "hidden",
        color: "#FFFFFF",

        bgcolor: {
          xs: "#2D58DB",
          md: "transparent",
        },

        borderRadius: {
          xs: "0 0 26px 26px",
          md: 0,
        },
      }}
    >
      {/* Azul principal do lado esquerdo */}
      <Box
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          position: "absolute",
          zIndex: 1,

          /*
            Aqui está o ponto principal da correção.

            Antes o círculo estava escalando errado em telas largas.
            Agora ele acompanha a largura e a altura da tela,
            mantendo o mesmo posicionamento visual do Figma.
          */
          width: "77.9vw",
          height: "200dvh",

          left: "-29.9vw",
          top: "-50dvh",

          borderRadius: "50%",

          background:
            "linear-gradient(180deg, #559DF0 0%, #2D63E4 46%, #2454DD 100%)",
        }}
      />

      {/* Fundo azul no mobile */}
      <Box
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          position: "absolute",
          inset: 0,
          zIndex: 1,

          background:
            "linear-gradient(180deg, #559DF0 0%, #2D63E4 46%, #2454DD 100%)",
        }}
      />

      {/* Bola grande inferior esquerda */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 2,

          width: {
            xs: "155px",
            md: "calc(258 * var(--u))",
          },

          height: {
            xs: "155px",
            md: "calc(258 * var(--u))",
          },

          left: {
            xs: "-60px",
            md: "calc(-80 * var(--u))",
          },

          bottom: {
            xs: "-72px",
            md: "calc(-74 * var(--u))",
          },

          borderRadius: "50%",

          background:
            "radial-gradient(circle at 35% 28%, #68B3FF 0%, #3B83EF 48%, #2D58DB 100%)",

          opacity: 0.8,
        }}
      />

      {/* Bola menor próxima da curva */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 3,

          width: {
            xs: "86px",
            md: "calc(138 * var(--u))",
          },

          height: {
            xs: "86px",
            md: "calc(138 * var(--u))",
          },

          left: {
            xs: "calc(100% - 49px)",
            md: "40.8vw",
          },

          bottom: {
            xs: "32px",
            md: "calc(38 * var(--u))",
          },

          transform: {
            xs: "none",
            md: "translateX(-50%)",
          },

          borderRadius: "50%",

          background:
            "radial-gradient(circle at 35% 28%, #68B3FF 0%, #3B83EF 50%, #2454DD 100%)",
        }}
      />

      {/* Conteúdo do lado esquerdo */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 4,

          /*
            No Figma, o conteúdo fica centralizado dentro do bloco azul,
            não colado na esquerda.
          */
          left: {
            xs: 0,
            md: "24vw",
          },

          top: {
            xs: 0,
            md: "10.2dvh",
          },

          transform: {
            xs: "none",
            md: "translateX(-50%)",
          },

          width: {
            xs: "100%",
            md: "clamp(330px, 42vw, 520px)",
          },

          px: {
            xs: "18px",
            md: 0,
          },

          pt: {
            xs: "28px",
            md: 0,
          },

          boxSizing: "border-box",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",

          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: {
              xs: "150px",
              md: "clamp(150px, calc(196 * var(--u)), 220px)",
            },

            mb: {
              xs: "28px",
              md: "calc(48 * var(--u))",
            },

            display: "flex",
            justifyContent: "center",

            "& img": {
              width: "100%",
              maxWidth: "none",
              height: "auto",
              display: "block",
            },
          }}
        >
          <Logo />
        </Box>

        <Typography
          component="h2"
          sx={{
            fontWeight: 700,
            textAlign: "center",

            fontSize: {
              xs: "22px",
              md: "calc(28 * var(--u))",
            },

            lineHeight: {
              xs: "27px",
              md: "calc(34 * var(--u))",
            },

            mb: {
              xs: "28px",
              md: "calc(34 * var(--u))",
            },
          }}
        >
          Junte-se à nossa comunidade
          <br />
          de cuidado
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            fontWeight: 400,

            fontSize: {
              xs: "14px",
              md: "calc(18 * var(--u))",
            },

            lineHeight: {
              xs: "18px",
              md: "calc(22 * var(--u))",
            },

            maxWidth: {
              xs: "330px",
              md: "390px",
            },

            mb: {
              xs: "25px",
              md: "calc(31 * var(--u))",
            },
          }}
        >
          Milhares de famílias já usam o Elo de Cuidado
          <br />
          para manter todos informados sobre a saúde
          <br />
          de seus entes queridos.
        </Typography>

        <Box
          component="ul"
          sx={{
            listStyle: "none",
            p: 0,
            m: 0,

            width: "fit-content",

            display: "flex",
            flexDirection: "column",

            gap: {
              xs: "8px",
              md: "calc(8 * var(--u))",
            },
          }}
        >
          {benefits.map((benefit) => (
            <Box
              component="li"
              key={benefit}
              sx={{
                display: "flex",
                alignItems: "center",
                color: "#FFFFFF",

                fontSize: {
                  xs: "13px",
                  md: "calc(18 * var(--u))",
                },

                lineHeight: {
                  xs: "16px",
                  md: "calc(21 * var(--u))",
                },

                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: {
                    xs: "14px",
                    md: "calc(16 * var(--u))",
                  },

                  mr: {
                    xs: "4px",
                    md: "calc(4 * var(--u))",
                  },
                }}
              />

              {benefit}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
