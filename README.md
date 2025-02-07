# 🍪 React Cookie Manager

A powerful, customizable React component for cookie consent management with built-in tracking prevention. This component provides a modern, user-friendly way to obtain and manage cookie consent from your website visitors.

![React Cookie Manager](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/react-cookie-manager.gif?raw=true)

## Features

- 🌐 Multiple display types (banner, popup, modal)
- 🛡️ Automatic tracking prevention (Google Analytics, etc.)
- 🎯 Granular cookie category controls (Analytics, Social, Advertising)
- 🎨 Light and dark theme support
- 📱 Responsive design
- 🔧 Highly customizable UI
- 💾 Persistent consent storage
- 🔒 Privacy-first approach
- 🇪🇺 Note: Full GDPR compliance requires you to store user consent in your own database.

## 🎮 Try it out!

### [🔗 Live Demo](https://react-cookie-manager.hypership.dev/)

See React Cookie Manager in action and explore all its features in our interactive demo.

## Automatically Disable Tracking

Unlike other cookie consent managers and React components, this component automatically disables tracking for Google Analytics, Facebook Pixel, and other tracking services. This is done by blocking the tracking scripts from loading. Therefore, you don't need to manually disable tracking, saving you hours of work.

## Installation

```bash
npm install react-cookie-manager
# or
yarn add react-cookie-manager
```

## Importing Styles

The component requires its CSS file to be imported in your application. Add the following import to your app's entry point (e.g., `App.tsx` or `index.tsx`):

```javascript
import "react-cookie-manager/style.css";
```

![React Cookie Manager Modal](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/modal.png?raw=true)

![React Cookie Manager Popup](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/popup.png?raw=true)

![React Cookie Manager Popup Dark](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/popup-dark.png?raw=true)

![React Cookie Manager Banner](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/banner.png?raw=true)

![React Cookie Manager Manage Cookies](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/manage-cookies.png?raw=true)

## Basic Usage

```jsx
import { CookieManager } from "react-cookie-manager";
import "react-cookie-manager/style.css";

function App() {
  return (
    <CookieManager
      translations={{
        title: "Cookie Preferences",
        message: "We use cookies to improve your experience."
      }}
      onManage={(preferences) =>
        console.log("Cookie preferences:", preferences)
      }
    >
      <YourApp />
    </CookieManager>
  );
}
```

## Full Usage

```jsx
import { CookieManager } from "react-cookie-manager";
import "react-cookie-manager/style.css";

function App() {
  return (
    <CookieManager
      translations={{
        title: "Would You Like A Cookie? 🍪",
        message: "We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.",
        buttonText: "Accept All",
        declineButtonText: "Decline All",
        manageButtonText: "Manage Cookies",
        privacyPolicyText: "Privacy Policy"
      }}
      showManageButton={true}
      privacyPolicyUrl="https://example.com/privacy"
      theme="light"
      displayType="popup"
      onManage={(preferences) => {
        if (preferences) {
          console.log("Cookie preferences updated:", preferences);
        }
      }}
    >
      <AppContent />
    </CookieManager>
  );
}
```

## Advanced Usage with Hook

```jsx
import { CookieManager, useCookieConsent } from "react-cookie-manager";

function CookieSettings() {
  const { showConsentBanner, detailedConsent } = useCookieConsent();

  return (
    <div>
      <button onClick={showConsentBanner}>Manage Cookie Settings</button>
      {detailedConsent && (
        <div>
          Analytics:{" "}
          {detailedConsent.Analytics.consented ? "Enabled" : "Disabled"}
          Social: {detailedConsent.Social.consented ? "Enabled" : "Disabled"}
          Advertising:{" "}
          {detailedConsent.Advertising.consented ? "Enabled" : "Disabled"}
        </div>
      )}
    </div>
  );
}
```

## Props

| Prop                       | Type                                     | Default                        | Description                               |
| -------------------------- | ---------------------------------------- | ------------------------------ | ----------------------------------------- |
| `children`                 | React.ReactNode                          | -                              | Your app components                       |
| `translations`             | TranslationObject \| TranslationFunction | -                              | Translation object or i18n TFunction      |
| `translationI18NextPrefix` | string                                   | -                              | i18next key prefix, e.g. "cookies."       |
| `showManageButton`         | boolean                                  | false                          | Whether to show the manage cookies button |
| `privacyPolicyUrl`         | string                                   | -                              | URL for the privacy policy                |
| `localStorageKey`          | string                                   | 'cookie-consent'               | Name of the key to store consent          |
| `cookieExpiration`         | number                                   | 365                            | Days until cookie expires                 |
| `displayType`              | 'banner' \| 'popup' \| 'modal'           | 'banner'                       | How the consent UI is displayed           |
| `position`                 | 'top' \| 'bottom'                        | 'bottom'                       | Position of the banner                    |
| `theme`                    | 'light' \| 'dark'                        | 'light'                        | Color theme                               |
| `disableAutomaticBlocking` | boolean                                  | false                          | Disable automatic tracking prevention     |
| `blockedDomains`           | string[]                                 | []                             | Additional domains to block               |
| `onManage`                 | (preferences?: CookieCategories) => void | -                              | Callback when preferences are updated     |

## Cookie Categories

The component manages three categories of cookies:

```typescript
interface CookieCategories {
  Analytics: boolean;
  Social: boolean;
  Advertising: boolean;
}
```

## Hook API

The `useCookieConsent` hook provides the following:

```typescript
interface CookieConsentHook {
  hasConsent: boolean | null;
  isDeclined: boolean;
  detailedConsent: DetailedCookieConsent | null;
  showConsentBanner: () => void;
  acceptCookies: () => void;
  declineCookies: () => void;
  updateDetailedConsent: (preferences: CookieCategories) => void;
}
```

## i18next support

```typescript
import { default as i18next } from "i18next";

function App() {
  return (
    <CookieManager
      translations={i18next.t}
      translationI18NextPrefix="cookies."
      ...
      />
  )
}
```

```json
// en.json
{
  "cookies": {
    "title": "Would You Like A Cookie? 🍪",
    "message": "We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.",
    "buttonText": "Accept All",
    "declineButtonText": "Decline All",
    "manageButtonText": "Manage Cookies",
    "privacyPolicyText": "Privacy Policy"
  }
  //...
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Hypership
