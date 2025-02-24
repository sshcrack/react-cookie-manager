// Import styles
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
      banner.className = "cookiekit-banner";
      banner.setAttribute("data-position", this.config.position);
      banner.innerHTML = `
        <div class="cookiekit-content">
          <div>
            <h2>Would you like to accept cookies?</h2>
            <p>We use cookies to enhance your browsing experience and analyze our traffic.</p>
          </div>
          <div class="cookiekit-buttons">
            <button class="cookiekit-button cookiekit-accept">Accept All</button>
            <button class="cookiekit-button cookiekit-customize">Customize</button>
          </div>
        </div>
      `;

      banner
        .querySelector(".cookiekit-accept")
        .addEventListener("click", () => {
          this.saveConsent({
            analytics: true,
            marketing: true,
            preferences: true,
          });
        });

      banner
        .querySelector(".cookiekit-customize")
        .addEventListener("click", () => {
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
      modal.className = "cookiekit-modal hidden";
      modal.innerHTML = `
        <h2>Cookie Preferences</h2>
        <div class="cookiekit-category">
          <label>
            <input type="checkbox" name="analytics" ${
              this.config.categories.analytics ? "checked" : ""
            }>
            Analytics
          </label>
          <p>Help us understand how visitors interact with our website.</p>
        </div>
        <div class="cookiekit-category">
          <label>
            <input type="checkbox" name="marketing" ${
              this.config.categories.marketing ? "checked" : ""
            }>
            Marketing
          </label>
          <p>Allow us to personalize your experience and send you relevant content.</p>
        </div>
        <div class="cookiekit-category">
          <label>
            <input type="checkbox" name="preferences" ${
              this.config.categories.preferences ? "checked" : ""
            }>
            Preferences
          </label>
          <p>Remember your settings and provide enhanced functionality.</p>
        </div>
        <div class="cookiekit-buttons">
          <button class="cookiekit-button cookiekit-save">Save Preferences</button>
        </div>
      `;

      const overlay = document.createElement("div");
      overlay.className = "cookiekit-overlay hidden";

      modal.querySelector(".cookiekit-save").addEventListener("click", () => {
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
        document.documentElement.style.setProperty(
          "--cookiekit-primary-color",
          this.config.primaryColor
        );
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
