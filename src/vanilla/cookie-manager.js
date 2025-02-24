// Import Tailwind styles
import "./cookie-manager.css";

// Remove the import and export, make it a pure IIFE
(function () {
  class CookieManager {
    constructor(config) {
      this.config = {
        cookieName: "cookie_consent",
        cookieExpiration: 365,
        position: "bottom",
        primaryColor: "#007bff",
        categories: {
          analytics: true,
          marketing: true,
          preferences: true,
        },
        ...config,
      };

      this.state = this.loadConsent();
    }

    injectStyles(cssContent) {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = cssContent;
      document.head.appendChild(styleSheet);
    }

    loadConsent() {
      const consent = this.getCookie(this.config.cookieName);
      return consent ? JSON.parse(consent) : null;
    }

    setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = "; expires=" + date.toUTCString();
      document.cookie = name + "=" + value + expires + "; path=/";
    }

    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    saveConsent(categories) {
      this.state = categories;
      this.setCookie(
        this.config.cookieName,
        JSON.stringify(categories),
        this.config.cookieExpiration
      );
      this.hideBanner();
      this.applyConsent();
    }

    applyConsent() {
      if (this.state?.analytics) {
        document
          .querySelectorAll('script[data-cookiekit="analytics"]')
          .forEach((script) => script.setAttribute("type", "text/javascript"));
      }

      if (this.state?.marketing) {
        document
          .querySelectorAll('script[data-cookiekit="marketing"]')
          .forEach((script) => script.setAttribute("type", "text/javascript"));
      }

      window.dispatchEvent(
        new CustomEvent("cookiekit:consent-updated", {
          detail: this.state,
        })
      );
    }

    createBanner() {
      const wrapper = document.createElement("div");
      wrapper.className = "cookie-manager";

      const banner = document.createElement("div");
      banner.className = `fixed z-[9999] font-sans ${
        this.config.position === "top"
          ? "top-0 left-0 right-0 shadow-md"
          : this.config.position === "floating"
          ? "bottom-5 left-5 right-5 max-w-md mx-auto rounded-lg shadow-lg"
          : "bottom-0 left-0 right-0 shadow-md"
      }`;
      banner.setAttribute("data-position", this.config.position);
      banner.innerHTML = `
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 p-4 bg-white">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Would you like to accept cookies?</h2>
            <p class="text-gray-600">We use cookies to enhance your browsing experience and analyze our traffic.</p>
          </div>
          <div class="flex gap-4">
            <button class="accept-all px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Accept All</button>
            <button class="customize px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Customize</button>
          </div>
        </div>
      `;

      banner.querySelector(".accept-all").addEventListener("click", () => {
        this.saveConsent({
          analytics: true,
          marketing: true,
          preferences: true,
        });
      });

      banner.querySelector(".customize").addEventListener("click", () => {
        this.showCustomizeModal();
      });

      wrapper.appendChild(banner);
      document.body.appendChild(wrapper);
      this.banner = banner;
      this.wrapper = wrapper;
    }

    createCustomizeModal() {
      const modalWrapper = document.createElement("div");
      modalWrapper.className = "cookie-manager";

      const modal = document.createElement("div");
      modal.className =
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white p-8 rounded-xl shadow-2xl z-[10000] hidden";
      modal.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Cookie Preferences</h2>
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <label class="flex items-center gap-2 font-medium text-gray-900">
              <input type="checkbox" name="analytics" ${
                this.config.categories.analytics ? "checked" : ""
              } class="w-4 h-4 rounded text-blue-600">
              Analytics
            </label>
            <p class="mt-2 text-gray-600">Help us understand how visitors interact with our website.</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <label class="flex items-center gap-2 font-medium text-gray-900">
              <input type="checkbox" name="marketing" ${
                this.config.categories.marketing ? "checked" : ""
              } class="w-4 h-4 rounded text-blue-600">
              Marketing
            </label>
            <p class="mt-2 text-gray-600">Allow us to personalize your experience and send you relevant content.</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <label class="flex items-center gap-2 font-medium text-gray-900">
              <input type="checkbox" name="preferences" ${
                this.config.categories.preferences ? "checked" : ""
              } class="w-4 h-4 rounded text-blue-600">
              Preferences
            </label>
            <p class="mt-2 text-gray-600">Remember your settings and provide enhanced functionality.</p>
          </div>
        </div>
        <div class="mt-8 flex justify-end">
          <button class="save-preferences px-6 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Save Preferences</button>
        </div>
      `;

      const overlay = document.createElement("div");
      overlay.className =
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] hidden";

      modal.querySelector(".save-preferences").addEventListener("click", () => {
        const categories = {
          analytics: modal.querySelector('input[name="analytics"]').checked,
          marketing: modal.querySelector('input[name="marketing"]').checked,
          preferences: modal.querySelector('input[name="preferences"]').checked,
        };
        this.saveConsent(categories);
        this.hideCustomizeModal();
      });

      modalWrapper.appendChild(overlay);
      modalWrapper.appendChild(modal);
      document.body.appendChild(modalWrapper);
      this.modal = modal;
      this.overlay = overlay;
      this.modalWrapper = modalWrapper;
    }

    showCustomizeModal() {
      this.modal.classList.remove("hidden");
      this.overlay.classList.remove("hidden");
    }

    hideCustomizeModal() {
      this.modal.classList.add("hidden");
      this.overlay.classList.add("hidden");
    }

    hideBanner() {
      this.banner.classList.add("hidden");
    }

    init() {
      if (!this.state) {
        this.createBanner();
        this.createCustomizeModal();
      }
    }
  }

  // Expose to global scope
  window.CookieKit = {
    init: (config) => {
      const manager = new CookieManager(config);
      manager.init();
    },
  };
})();
