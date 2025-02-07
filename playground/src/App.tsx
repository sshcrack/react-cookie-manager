import { useCookieConsent } from "../../dist";
import "./App.css";
import reactLogo from "./assets/react.svg";

function App() {
  const { showConsentBanner } = useCookieConsent();

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <span style={{ fontSize: "6rem" }}>🍪</span>
      </div>
      <h1>React Cookie Manager Playground</h1>
      <div className="card">
        <button onClick={showConsentBanner}>Show Cookie Consent Banner</button>
      </div>
      <p className="read-the-docs">
        Click on the logo to learn more about React Cookie Manager
      </p>
    </>
  );
}

export default App;
