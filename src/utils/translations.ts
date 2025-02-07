import {
  FullTranslationObject,
  TranslationFunction,
  TranslationKey,
  TranslationObject,
} from "../types/types";

const DEFAULT_TRANSLATIONS: FullTranslationObject = {
  title: "",
  message: "This website uses cookies to enhance your experience.",
  buttonText: "Accept",
  declineButtonText: "Decline",
  manageButtonText: "Manage Cookies",
  privacyPolicyText: "Privacy Policy",
  manageTitle: "Cookie Preferences",
  manageMessage:
    "Manage your cookie preferences below. Essential cookies are always enabled as they are necessary for the website to function properly.",
  manageEssentialTitle: "Essential",
  manageEssentialSubtitle: "Required for the website to function properly",
  manageEssentialStatus: "Status: Always enabled",
  manageEssentialStatusButtonText: "Always On",
  manageAnalyticsTitle: "Analytics",
  manageAnalyticsSubtitle:
    "Help us understand how visitors interact with our website",
  manageSocialTitle: "Social",
  manageSocialSubtitle: "Enable social media features and sharing",
  manageAdvertTitle: "Advertising",
  manageAdvertSubtitle:
    "Personalize advertisements and measure their performance",
  manageCookiesStatus: "Status: {{status}} on {{date}}",
  manageCookiesStatusConsented: "Consented",
  manageCookiesStatusDeclined: "Declined",
  manageCancelButtonText: "Cancel",
  manageSaveButtonText: "Save Preferences",
};

function getTranslationValue(
  tObject: FullTranslationObject,
  key: TranslationKey,
  params?: Record<string, string>
): string {
  if (params) {
    return Object.keys(params).reduce((acc, param) => {
      return acc.replace(
        new RegExp(`{{\\s*${param}\\s*}}`, "g"),
        params[param]
      );
    }, tObject[key]);
  }

  return tObject[key];
}

export type TFunction = (
  key: TranslationKey,
  params?: Record<string, string>
) => string;

export function createTFunction(
  translations?: TranslationObject | TranslationFunction<any, any>,
  translationI18NextPrefix?: string
): TFunction {
  if (typeof translations === "function") {
    return (key: TranslationKey, params?: Record<string, string>) => {
      const fullKey = `${translationI18NextPrefix || ""}${key}`;
      let i18nValue = translations(fullKey, params);
      if (i18nValue === fullKey) {
        i18nValue = null;
      }
      return (
        i18nValue || getTranslationValue(DEFAULT_TRANSLATIONS, key, params)
      );
    };
  }

  return (key: TranslationKey, params?: Record<string, string>) => {
    return getTranslationValue(
      { ...DEFAULT_TRANSLATIONS, ...(translations || {}) },
      key,
      params
    );
  };
}
