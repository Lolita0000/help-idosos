import { Card, CardContent, Container, Box } from "@mui/material";

interface Props {
  children: React.ReactNode;
}

export default function AuthCard({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fa",
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #e0e6ed"
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {children}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}