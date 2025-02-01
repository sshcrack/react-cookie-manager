import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CookieManager } from "../../dist/";
import "../../dist/style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <CookieManager
      title="Would You Like A Cookie? 🍪"
      message="We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly."
      buttonText="Accept All"
      declineButtonText="Decline All"
      showManageButton={true}
      manageButtonText="Manage Cookies"
      privacyPolicyUrl="https://example.com/privacy"
      privacyPolicyText="Privacy Policy"
      theme="dark"
      displayType="popup"
      onManage={(preferences: any) => {
        if (preferences) {
          console.log("Cookie preferences updated:", preferences);
        }
      }}
    >
      This website uses cookies to enhance the user experience.{" "}
    </CookieManager>
  </StrictMode>
);
