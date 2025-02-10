"use client";

import { useCookieConsent } from "../../../dist";

export default function Home() {
  const { showConsentBanner, detailedConsent } = useCookieConsent();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Cookie Consent Playground</h1>

      <div className="flex flex-col gap-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Current Consent State:</h2>
          {detailedConsent && (
            <div>
              <div>
                Analytics:{" "}
                {detailedConsent.Analytics.consented ? "Enabled" : "Disabled"}
              </div>
              <div>
                Social:{" "}
                {detailedConsent.Social.consented ? "Enabled" : "Disabled"}
              </div>
              <div>
                Advertising:{" "}
                {detailedConsent.Advertising.consented ? "Enabled" : "Disabled"}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={showConsentBanner}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Manage Cookie Settings
        </button>
      </div>
    </main>
  );
}
