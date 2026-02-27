import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { FamilyRestroom, AdminPanelSettings } from "@mui/icons-material";

export default function AccountTypeSelect() {
  return (
    <FormControl fullWidth>
      <InputLabel>Tipo de conta</InputLabel>

      <Select label="Tipo de conta" defaultValue="responsavel">
        <MenuItem value="responsavel">
          <FamilyRestroom sx={{ mr: 1 }} fontSize="small" />
          Responsável
        </MenuItem>

      </Select>
    </FormControl>
  );
}