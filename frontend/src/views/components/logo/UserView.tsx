import Logo from "./Logo";

export default function UserView() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#4A90E2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center" }}>
        
        <div style={{ marginBottom: "-30px" }}>
          <Logo />
        </div>

        <p
          style={{
            fontWeight: 400,
            fontSize: "clamp(18px, 4vw, 25px)",
            color: "#fff",
            marginBottom: "60px",
            lineHeight: "1.4",
          }}
        >
          Cuidando de quem você <br />
          ama, juntos
        </p>

        <button
          style={{
            fontWeight: 700,
            width: "min(357px, 80vw)",
            height: "clamp(60px, 12vw, 95px)",
            backgroundColor: "#1D4ED8",
            borderRadius: "50px",
            border: "none",
            color: "#fff",
            fontSize: "clamp(18px, 5vw, 30px)",
            cursor: "pointer",
          }}
        >
          Começar
        </button>

      </div>
    </div>
  );
}