import { useState } from "react";
import { cadastrarUsuario } from "../controllers/userController";

export default function UserView() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleSubmit = async () => {
    await cadastrarUsuario(nome, telefone);
    alert("Usuário cadastrado hihiii ^^");
  };

  return (
    <div>
      <h1>Cadastro</h1>

      <input
        placeholder="Nome"
        onChange={(e) => setNome(e.target.value)}
      />

      <input
        placeholder="Telefone"
        onChange={(e) => setTelefone(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Salvar
      </button>
    </div>
  );
}