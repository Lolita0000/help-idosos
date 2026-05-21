import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Typography } from "@mui/material";

type BenefitItemProps = {
  text: string;
};

export default function BenefitItem({ text }: BenefitItemProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: {
          xs: 0.5,
          md: 0.5,
        },
      }}
    >
      <CheckCircleOutlineIcon
        sx={{
          fontSize: {
            xs: 13,
            md: 17,
          },
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          fontSize: {
            xs: 12,
            sm: 13,
            md: 18,
          },
          lineHeight: 1.25,
          textAlign: "left",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
