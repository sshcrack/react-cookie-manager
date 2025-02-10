"use client";

import { useState } from "react";
import CookieConsenter from "../../../src/components/CookieConsenter";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [consent, setConsent] = useState({
    analytics: false,
    marketing: false,
  });
  const { t } = useTranslation();

  const handleAccept = () => {
    setConsent({ analytics: true, marketing: true });
    console.log("Cookies accepted");
  };

  const handleDecline = () => {
    setConsent({ analytics: false, marketing: false });
    console.log("Cookies declined");
  };

  const handleManage = (categories?: any) => {
    if (categories) {
      setConsent(categories);
      console.log("Cookie preferences updated:", categories);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Cookie Consent Playground</h1>

      <div className="flex flex-col gap-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Current Consent State:</h2>
          <pre>{JSON.stringify(consent, null, 2)}</pre>
        </div>
      </div>

      <CookieConsenter
        tFunction={t}
        showManageButton={true}
        privacyPolicyUrl="https://example.com/privacy"
        displayType="banner"
        theme="light"
        onAccept={handleAccept}
        onDecline={handleDecline}
        onManage={handleManage}
      />
    </main>
  );
}
