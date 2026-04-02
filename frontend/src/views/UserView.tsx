import { Box, Button, Typography, Container } from "@mui/material";
import Logo from "./components/logo/Logo";
export default function UserView() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        width: '100vw', 
        background: 'linear-gradient(135deg, #5D9CEC 0%, #4A90E2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
        
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </Box>

        <Typography variant="body1" sx={{ color: '#fff', mb: 6 }}>
          Cuidando de quem você ama, juntos
        </Typography>

        <Button 
          variant="contained" 
          sx={{ 
            py: 1.5, 
            px: 8, 
            backgroundColor: '#2555D1', 
            borderRadius: '25px', 
            textTransform: 'none' 
          }}
        >
          Começar
        </Button>

      </Container>
    </Box>
  );
}