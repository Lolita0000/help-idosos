import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  List,
  ListItem,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import logo from '../../views/components/logo/logo.png';

/* ── Bolhas Decorativas Idênticas ao Figma ──────────────── */
const BUBBLES = [
  // Topo Esquerda
  { w: { xs: "120px", md: "240px" }, h: { xs: "120px", md: "240px" }, top: "-80px", left: "-80px", bg: "rgba(255, 255, 255, 0.12)" },
  // Topo Direita
  { w: { xs: "100px", md: "200px" }, h: { xs: "100px", md: "200px" }, top: "40px", right: "-100px", bg: "rgba(255, 255, 255, 0.08)" },
  // Inferior Esquerda
  { w: { xs: "140px", md: "280px" }, h: { xs: "140px", md: "280px" }, bottom: "-100px", left: "-60px", bg: "rgba(255, 255, 255, 0.08)" },
  // Inferior Direita
  { w: { xs: "130px", md: "260px" }, h: { xs: "130px", md: "260px" }, bottom: "-60px", right: "-100px", bg: "rgba(255, 255, 255, 0.12)" },
];

type BubbleProps = (typeof BUBBLES)[number];
const Bubble: React.FC<BubbleProps> = ({ w, h, top, bottom, left, right, bg }) => (
  <Box 
    sx={{ 
      position: "absolute", 
      borderRadius: "50%", 
      pointerEvents: "none", 
      width: w, 
      height: h, 
      top, 
      bottom, 
      left, 
      right, 
      background: bg, 
      zIndex: 0,
      filter: "blur(2px)" // Suaviza as bordas como no efeito do Figma
    }} 
  />
);

/* ── Componente Principal ───────────────────────────── */
const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState("");

  const handleEnviar = () => {
    if (!email.trim()) return;
    setEmailEnviado(email.trim());
    setEnviado(true);
  };

  const handleTentarOutro = () => {
    setEmail("");
    setEnviado(false);
    setEmailEnviado("");
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        background: "linear-gradient(180deg, #559DF0 0%, #2D63E4 46%, #2454DD 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: 2,
        py: 3,
      }}
    >
      {BUBBLES.map((b, i) => <Bubble key={i} {...b} />)}

      {/* Logo */}
      <Box sx={{ mb: 4, zIndex: 1, display: "flex", justifyContent: "center" }}>
        <Box
          component="img"
          src={logo}
          alt="Elo de Cuidado"
          sx={{
            height: { xs: '70px', md: '85px' },
            width: 'auto',
          }}
        />
      </Box>

      {/* Card Principal */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "700px",
          minHeight: { md: "519px" },
          borderRadius: "15px",
          backgroundColor: "#BFDBFE",
          p: { xs: 3, sm: 5, md: "50px" },
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)"
        }}
      >
        {!enviado ? (
          <>
            <Typography sx={{ fontFamily: "Inter", textAlign: "center", fontWeight: 600, color: "#000", mb: 1.5, fontSize: { xs: "24px", md: "32px" }, lineHeight: 1.2 }}>
              Recuperar senha
            </Typography>
            <Typography sx={{ fontFamily: "Inter", textAlign: "center", color: "rgba(0, 0, 0, 0.50)", fontSize: { xs: "15px", md: "18px" }, fontWeight: 500, lineHeight: 1.4, mb: 4, maxWidth: "480px" }}>
              Digite seu e-mail e enviaremos um link para você criar uma nova senha.
            </Typography>

            <Box sx={{ width: "100%", maxWidth: "460px" }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, color: "#000", mb: 1, fontSize: { xs: "16px", md: "20px" }, lineHeight: "normal", textAlign: "left" }}>
                Digite seu e-mail:
              </Typography>
              
              <TextField
                fullWidth
                placeholder="seuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    height: "48px",
                    borderRadius: "10px",
                    backgroundColor: "#E3E3E3",
                    fontSize: "16px",
                    "& fieldset": { 
                      borderColor: "#6B7280",
                      borderWidth: "1px" 
                    },
                    "&:hover fieldset": { borderColor: "#6B7280" },
                    "&.Mui-focused fieldset": { borderColor: "#1D4ED8", borderWidth: "2px" },
                  },
                }}
              />

              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleEnviar}
                sx={{ 
                  height: "48px",
                  backgroundColor: "#1D4ED8", 
                  borderRadius: "10px", 
                  boxShadow: "2px 4px 6px 0 rgba(0, 0, 0, 0.35)",
                  textTransform: "none", 
                  fontFamily: "Inter",
                  fontWeight: 600, 
                  fontSize: { xs: "18px", md: "20px" }, 
                  lineHeight: "normal",
                  color: "#FFF",
                  "&:hover": { backgroundColor: "#153bb3" }, 
                  mb: 3 
                }}
              >
                Enviar link de recuperação
              </Button>

              <Typography sx={{ textAlign: "center", color: "#6B7280", fontFamily: "Inter", fontSize: { xs: "15px", md: "17px" }, fontWeight: 500, lineHeight: "normal" }}>
                Voltar para{" "}
                <Link href="/login" underline="none" sx={{ color: "#4A90E2", fontWeight: 700, fontFamily: "Inter" }}>Login.</Link>
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#22C55E" }} />
            </Box>
            <Typography sx={{ fontFamily: "Inter", textAlign: "center", fontWeight: 600, color: "#000", mb: 1.5, fontSize: { xs: "24px", md: "32px" }, lineHeight: 1.2 }}>
              E-mail enviado!
            </Typography>
            <Typography sx={{ fontFamily: "Inter", textAlign: "center", color: "rgba(0, 0, 0, 0.50)", fontSize: { xs: "15px", md: "18px" }, fontWeight: 500, lineHeight: 1.4, mb: 4, maxWidth: "480px" }}>
              Enviamos um link de recuperação para{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "#000" }}>{emailEnviado}</Box>
            </Typography>

            <Box sx={{ width: "100%", maxWidth: "460px" }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, color: "#000", fontSize: { xs: "15px", md: "18px" }, mb: 1 }}>
                Não recebeu o e-mail?
              </Typography>
              <List dense disablePadding sx={{ mb: 3.5 }}>
                {["Verifique sua pasta de spam", "Confirme se o e-mail está correto", "Aguarde alguns minutos"].map((txt) => (
                  <ListItem key={txt} sx={{ py: 0.25, px: 0, alignItems: "center" }}>
                    <Box component="span" sx={{ mr: 1, color: "rgba(0, 0, 0, 0.40)", fontSize: "14px" }}>•</Box>
                    <Typography sx={{ color: "rgba(0, 0, 0, 0.50)", fontFamily: "Inter", fontSize: { xs: "14px", md: "16px" }, fontWeight: 500 }}>{txt}</Typography>
                  </ListItem>
                ))}
              </List>

              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleTentarOutro}
                sx={{ 
                  height: "48px",
                  backgroundColor: "#1D4ED8", 
                  borderRadius: "10px", 
                  boxShadow: "2px 4px 6px 0 rgba(0, 0, 0, 0.35)",
                  textTransform: "none", 
                  fontFamily: "Inter",
                  fontWeight: 600, 
                  fontSize: { xs: "18px", md: "20px" }, 
                  lineHeight: "normal",
                  color: "#FFF",
                  "&:hover": { backgroundColor: "#153bb3" }, 
                  mb: 3 
                }}
              >
                Tentar outro e-mail
              </Button>

              <Typography sx={{ textAlign: "center", color: "#6B7280", fontFamily: "Inter", fontSize: { xs: "15px", md: "17px" }, fontWeight: 500, lineHeight: "normal" }}>
                Voltar para o{" "}
                <Link href="/login" underline="none" sx={{ color: "#4A90E2", fontWeight: 700, fontFamily: "Inter" }}>Login.</Link>
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default RecuperarSenha;