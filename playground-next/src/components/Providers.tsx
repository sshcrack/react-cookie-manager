"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import { CookieManager } from "../../../dist/";
import "../../../dist/style.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <CookieManager translations={i18n.t}>{children}</CookieManager>
    </I18nextProvider>
  );
}
