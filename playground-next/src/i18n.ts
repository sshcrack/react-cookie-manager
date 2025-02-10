import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      title: "Cookie Settings 🍪",
      message:
        "We use cookies to improve your experience on our website. Choose which cookies you want to allow.",
      buttonText: "Accept All",
      declineButtonText: "Decline All",
      manageButtonText: "Manage Cookies",
      privacyPolicyText: "Privacy Policy",
      manageTitle: "Cookie Preferences",
      manageMessage: "Customize your cookie preferences below",
      manageEssentialTitle: "Essential Cookies",
      manageAnalyticsTitle: "Analytics",
      manageSocialTitle: "Social",
      manageAdvertTitle: "Advertising",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
