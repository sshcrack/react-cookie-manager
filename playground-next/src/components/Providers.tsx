"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import dynamic from "next/dynamic";
import "../../../dist/style.css";

const CookieManager = dynamic(
  () => import("../../../dist").then((mod) => mod.CookieManager),
  {
    ssr: false,
    loading: () => null,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <CookieManager
        enableFloatingButton={true}
        showManageButton={true}
        translations={i18n.t}
        displayType="banner"
        theme="light"
      >
        {children}
      </CookieManager>
    </I18nextProvider>
  );
}
