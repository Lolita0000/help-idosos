import Logo from "./components/logo/Logo";

export default function UserView() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#4A90E2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        
        <div style={{ marginBottom: '-30px' }}>
          <Logo />
        </div>

        <p
          style={{
            fontWeight: 400,
            fontSize: '25px',
            color: '#fff',
            marginBottom: '60px'
          }}
        >
          Cuidando de quem você <br />
          ama, juntos
        </p>

        <button
          style={{
            fontWeight: 700,
            width: '357px',
            height: '95px',
            backgroundColor: '#1D4ED8',
            borderRadius: '50px',
            border: 'none',
            color: '#fff',
            fontSize: '30px',
            cursor: 'pointer'
          }}
        >
          Começar
        </button>

      </div>
    </div>
  );
}