import { useState } from "react";
import UserView from "./views/components/logo/UserView";
import RegisterView from "./views/RegisterView";
import Login from "./pages/Login/Login";

function App() {
  const [screen, setScreen] = useState("home");

  if (screen === "login") {
    return (
      <Login 
        onLogin={() => setScreen("home")}
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterView 
        onRegister={() => setScreen("login")}
      />
    );
  }

  return (
    <UserView 
      onStart={() => setScreen("register")}
    />
  );
}

export default App;