import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    background: { default: '#f5f7fa' }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e6ed'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(33,150,243,0.3)'
        }
      }
    }
  }
});