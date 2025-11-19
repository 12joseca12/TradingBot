export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>TradingBot Backend API</h1>
      <p>API operativa. Endpoints principales:</p>
      <ul>
        <li>POST /api/auth/register</li>
        <li>POST /api/auth/login</li>
        <li>GET/POST /api/settings</li>
        <li>POST /api/credentials/kraken</li>
        <li>POST /api/affiliate/register</li>
      </ul>
    </main>
  );
}

