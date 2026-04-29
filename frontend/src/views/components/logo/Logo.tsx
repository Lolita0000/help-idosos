import logo from './logo.png';

export default function Logo() {
  return (
    <img
      src={logo}
      alt="Elo de Cuidado"
      style={{
      width: '100%',
      maxWidth: '250px',
      height: 'auto'
    }}
    />
  );
}