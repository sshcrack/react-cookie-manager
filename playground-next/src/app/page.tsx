"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCookieConsent } from "react-cookie-manager";

export default function Home() {
  const { showConsentBanner, detailedConsent } = useCookieConsent();
  const [consentStatus, setConsentStatus] = useState<string>("Checking...");

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
    <main className="min-h-screen flex flex-col items-center gap-10 py-16 px-6">
      <div className="flex items-center justify-center gap-8">
        <span className="text-5xl md:text-6xl font-extrabold tracking-tight">Next.js</span>
        <span className="text-7xl">🍪</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-center">
        Next.js Cookie Manager Playground
      </h1>

      <div className="w-full max-w-3xl rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Cookie Consent Status</h2>
        <p className="mb-4">
          Marketing/Advertising Cookies: <strong>{consentStatus}</strong>
        </p>
        <button
          onClick={showConsentBanner}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Show Cookie Consent Banner
        </button>
      </div>

      <div className="w-full max-w-4xl rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">YouTube Video Embed Test</h2>
        <p className="mb-6">
          This YouTube video is embedded directly to observe what happens when cookies haven&apos;t been accepted yet.
        </p>
        <div className="flex flex-col items-center gap-6">
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
      </div>

      <Link
        href="/ssr-example"
        className="mt-2 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-800 transition-colors"
      >
        View SSR Example Page
      </Link>
    </main>
  );
}
