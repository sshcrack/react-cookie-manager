import { useCookieConsent } from "react-cookie-manager";
import "./App.css";
import reactLogo from "./assets/react.svg";
import { useState, useEffect } from "react";

function App() {
  const { showConsentBanner, detailedConsent } = useCookieConsent();
  const [consentStatus, setConsentStatus] = useState<string>("Checking...");

  // Track consent status changes
  useEffect(() => {
    if (detailedConsent) {
      const status = detailedConsent.Advertising.consented
        ? "Accepted"
        : "Not Accepted";
      setConsentStatus(status);
    } else {
      setConsentStatus("Not Set");
    }
  }, [detailedConsent]);

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
        <h2>Cookie Consent Status</h2>
        <p>
          Marketing/Advertising Cookies: <strong>{consentStatus}</strong>
        </p>
        <button onClick={showConsentBanner}>Show Cookie Consent Banner</button>
      </div>

      <div className="card">
        <h2>YouTube Video Embed Test</h2>
        <p>
          This YouTube video is embedded directly to observe what happens when
          cookies haven't been accepted yet.
        </p>

        {/* Direct YouTube embed without conditional rendering */}
        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="video-container">
          <iframe
            width="800"
            height="315"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default App;
