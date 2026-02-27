import { TextField } from "@mui/material";

interface Props {
  label: string;
  type?: string;
  icon: React.ReactNode;
}

export default function InputField({ label, type = "text", icon }: Props) {
  return (
    <TextField
      label={label}
      type={type}
      fullWidth
      InputProps={{
        startAdornment: icon
      }}
    />
  );
}