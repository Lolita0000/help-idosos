import React, { useState } from 'react';
import { Box, Typography, Button, Link, IconButton } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import logo from '../../views/components/logo/logo.png';

const GRADIENT = 'linear-gradient(180deg, #559DF0 0%, #2D63E4 46%, #2454DD 100%)';

type LoginProps = {
  onLogin?: () => void;
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');

  const baseInput = {
    border: '1px solid #6B7280',
    borderRadius: '10px',
    background: '#E3E3E3',
    fontFamily: 'Inter',
    fontWeight: 500,
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box' as const,
    display: 'block',
    width: '100%',
    '&:focus': { borderColor: '#4A90E2' },
  };

  return (
    <Box sx={{ minHeight: '100dvh', width: '100%', bgcolor: { xs: '#EAF7FF', md: '#FFFFFF' }, position: 'relative', overflow: 'hidden' }}>

      {}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          left: 0, top: 0,
          width: '52vw',
          height: '100dvh',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <Box sx={{
          position: 'absolute',
          width: '77.9vw',
          height: '200dvh',
          left: '-29.9vw',
          top: '-50dvh',
          borderRadius: '50%',
          background: GRADIENT,
          zIndex: 1,
        }} />

        <Box sx={{
          position: 'absolute',
          width: '270px', height: '270px',
          borderRadius: '50%',
          background: 'rgba(22, 55, 165, 0.68)',
          bottom: '-85px', left: '-85px',
          zIndex: 2,
        }} />

        <Box sx={{
          position: 'absolute',
          width: '215px', height: '215px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.52)',
          bottom: '-60px', left: '30%',
          zIndex: 2,
        }} />

        <Box sx={{
          position: 'absolute',
          zIndex: 4,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: 'clamp(280px, 36vw, 480px)',
          px: 1,
        }}>
          <Box component="img" src={logo} alt="Elo de Cuidado"
            sx={{ width: 'clamp(200px, 34vw, 493px)', height: 'auto', mb: 4 }}
          />
          <Typography sx={{ color: '#FFF', fontFamily: 'Inter', fontSize: '35px', fontWeight: 600, lineHeight: 'normal', mb: 2.5 }}>
            Cuide de quem você ama
          </Typography>
          <Typography sx={{ color: '#FFF', fontFamily: 'Inter', fontSize: '24px', fontWeight: 500, lineHeight: 'normal' }}>
            O Elo de Cuidado permitte que você e sua família acompanhem juntos a saúde de pessoas queridas, compartilhando informações importantes de forma segura e organizada.
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        display: { xs: 'none', md: 'block' },
        position: 'absolute',
        width: '115px', height: '115px',
        borderRadius: '50%',
        background: 'rgba(74, 144, 226, 0.52)',
        bottom: '38px', right: '28px',
        zIndex: 0,
      }} />

      <Box
        component="main"
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          top: 0,
          left: '52vw',
          width: '48vw',
          height: '100dvh',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '507px', gap: '18px' }}>

          <Typography sx={{ color: '#000', fontFamily: 'Inter', fontSize: '35px', fontWeight: 600, width: '100%', textAlign: 'center' }}>
            Bem-vindo de volta
          </Typography>

          <Typography sx={{ color: 'rgba(0,0,0,0.50)', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, width: '100%', textAlign: 'center' }}>
            Entre com suas credenciais para acessar sua conta
          </Typography>

          {/* Campo E-mail */}
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#000', fontFamily: 'Inter', fontSize: '25px', fontWeight: 500, mb: 0.75 }}>
              E-mail:
            </Typography>
            <Box
              component="input"
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              sx={{ ...baseInput, height: '50px', px: '16px', fontSize: '20px', '&::placeholder': { color: '#6B7280', textAlign: 'center' } }}
            />
          </Box>

          {/* Campo Senha */}
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#000', fontFamily: 'Inter', fontSize: '25px', fontWeight: 500, mb: 0.75 }}>
              Digite uma senha:
            </Typography>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <Box
                component="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                sx={{ ...baseInput, height: '50px', pl: '16px', pr: '52px', fontSize: '20px', '&::placeholder': { color: '#6B7280', textAlign: 'center' } }}
              />
              <IconButton
                onClick={() => setShowPassword(p => !p)}
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}
              >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </Box>
          </Box>

          <Typography sx={{ color: '#6B7280', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, textAlign: 'center', width: '100%' }}>
            Esqueceu a senha?{' '}
            <Link href="/recuperar-senha" underline="none" sx={{ color: '#4A90E2', fontFamily: 'Inter', fontSize: '20px', fontWeight: 700 }}>
              Clique aqui.
            </Link>
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{
              background: '#1D4ED8',
              borderRadius: '10px',
              boxShadow: '4px 4px 4px 0px rgba(0,0,0,0.50)',
              height: '56px',
              color: '#FFF',
              fontFamily: 'Inter',
              fontSize: '25px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { background: '#1842b8' },
            }}
          >
            Entrar
          </Button>

          <Typography sx={{ color: '#6B7280', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, textAlign: 'center', width: '100%' }}>
            Não tem uma conta?{' '}
            <Link href="/cadastro" underline="none" sx={{ color: '#4A90E2', fontFamily: 'Inter', fontSize: '20px', fontWeight: 700 }}>
              Cadastre-se.
            </Link>
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        alignItems: 'center',
        background: GRADIENT,
        width: '100%',
        pt: '48px',
        pb: '64px',
        px: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box component="img" src={logo} alt="Elo de Cuidado" sx={{ width: '170px', height: 'auto', mb: '12px' }} />
        <Typography sx={{ color: '#FFF', fontFamily: 'Inter', fontSize: '20px', fontWeight: 600, textAlign: 'center', mb: '8px' }}>
          Cuide de quem você ama!
        </Typography>
        <Typography sx={{ color: '#FFF', fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, textAlign: 'center' }}>
          O Elo de Cuidado permitte que você e sua família acompanhem juntos a saúde de pessoas queridas, compartilhando informações importantes de forma segura e organizada.
        </Typography>

        {/* Bolhas mobile — canto inferior direito */}
        <Box sx={{ position: 'absolute', width: '92px', height: '92px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.62)', bottom: '-8px', right: '28px' }} />
        <Box sx={{ position: 'absolute', width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(74, 144, 226, 0.50)', bottom: '62px', right: '8px' }} />
      </Box>

      {}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: '#FFFFFF',
        mx: '16px',
        mt: '62px',
        mb: '24px',
        borderRadius: '12px',
        border: '1.5px solid rgba(74, 144, 226, 0.45)',
        p: '24px 20px',
        position: 'relative',
        zIndex: 2,
        gap: '16px',
      }}>
        <Typography sx={{ color: '#000', fontFamily: 'Inter', fontSize: '30px', fontWeight: 600, textAlign: 'center' }}>
          Bem-vindo de volta
        </Typography>

        <Typography sx={{ color: 'rgba(0,0,0,0.50)', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, textAlign: 'center' }}>
          Entre com suas credenciais para acessar sua conta
        </Typography>

        <Box sx={{ width: '100%', maxWidth: '337px' }}>
          <Typography sx={{ color: '#000', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, mb: '6px' }}>
            E-mail:
          </Typography>
          <Box
            component="input"
            type="email"
            placeholder="Digite seu e-mail.."
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            sx={{ ...baseInput, height: '39px', px: '14px', fontSize: '16px', '&::placeholder': { color: '#6B7280' } }}
          />
        </Box>

        <Box sx={{ width: '100%', maxWidth: '337px' }}>
          <Typography sx={{ color: '#000', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, mb: '6px' }}>
            Senha:
          </Typography>
          <Box
            component="input"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            sx={{ ...baseInput, height: '39px', px: '14px', fontSize: '16px', '&::placeholder': { color: '#6B7280' } }}
          />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#6B7280', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, display: 'inline' }}>
            Esqueceu a senha?{' '}
          </Typography>
          <br />
          <Link href="/recuperar-senha" underline="none" sx={{ color: '#4A90E2', fontFamily: 'Inter', fontSize: '20px', fontWeight: 700 }}>
            Clique aqui.
          </Link>
        </Box>

        <Button
          variant="contained"
          sx={{
            background: '#1D4ED8',
            borderRadius: '10px',
            boxShadow: '4px 4px 4px 0px rgba(0,0,0,0.50)',
            height: '33px',
            width: '314px',
            color: '#FFF',
            fontFamily: 'Inter',
            fontSize: '20px',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { background: '#1842b8' },
          }}
        >
          Entrar
        </Button>

        <Typography sx={{ color: '#6B7280', fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, textAlign: 'center' }}>
          Não possui conta?{' '}
          <Link href="/cadastro" underline="none" sx={{ color: '#4A90E2', fontFamily: 'Inter', fontSize: '20px', fontWeight: 700 }}>
            Cadastre-se.
          </Link>
        </Typography>
      </Box>

    </Box>
  );
};

export default Login;