/**
 * Handles blocking of tracking scripts and iframes, replacing them with placeholders
 */

/**
 * Applies common styling to the wrapper element
 * @param wrapper The wrapper element to style
 * @param width Optional width to apply
 * @param height Optional height to apply
 */
const applyWrapperStyles = (
  wrapper: HTMLElement,
  width: string = "100%",
  height: string = "315px"
): void => {
  wrapper.style.position = "relative";
  wrapper.style.width = width;
  wrapper.style.height = height;
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.backgroundColor = "rgba(31, 41, 55, 0.95)";
  wrapper.style.borderRadius = "6px";
  wrapper.style.border = "1px solid #4b5563";
  wrapper.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  wrapper.style.overflow = "hidden";
  wrapper.style.backdropFilter = "blur(4px)";
  wrapper.style.textAlign = "center";
  wrapper.style.color = "#f3f4f6";
  wrapper.style.fontSize = "14px";
  wrapper.style.lineHeight = "1.4";
  wrapper.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
};

/**
 * Creates the content HTML for the blocked content placeholder
 * @param placeholderId The unique ID for the placeholder
 * @returns HTML string for the placeholder content
 */
const createPlaceholderContent = (placeholderId: string): string => {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 16px; width: 100%; max-width: 95%; box-sizing: border-box;">
      <div style="margin-bottom: 8px; font-size: 28px;">🔒</div>
      <h3 style="font-size: 16px; margin: 0 0 8px 0; font-weight: bold; color: white;">Content Blocked</h3>
      <p style="margin: 0 0 8px 0; font-size: 14px;">This content requires cookies that are currently blocked by your privacy settings. This embedded content may track your activity.</p>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #d1d5db;">After accepting cookies, please refresh the page to view this content.</p>
      <button id="cookie-settings-${placeholderId}" style="margin-top: 10px; background-color: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 500; cursor: pointer; font-size: 13px; transition: all 0.2s ease;">
        Manage Cookie Settings
      </button>
    </div>
  `;
};

/**
 * Adds event listeners to the settings button
 * @param placeholderId The unique ID for the placeholder
 */
const addSettingsButtonListeners = (placeholderId: string): void => {
  const settingsButton = document.getElementById(
    `cookie-settings-${placeholderId}`
  );
  if (settingsButton) {
    settingsButton.addEventListener("mouseover", () => {
      settingsButton.style.backgroundColor = "#2563eb";
    });
    settingsButton.addEventListener("mouseout", () => {
      settingsButton.style.backgroundColor = "#3b82f6";
    });
    settingsButton.addEventListener("click", () => {
      // Try to show cookie settings
      window.dispatchEvent(new CustomEvent("show-cookie-consent"));
    });
  }
};

/**
 * Positions an iframe absolutely within its parent to prevent layout disruption
 * @param iframe The iframe element to position
 */
const positionIframeAbsolutely = (iframe: HTMLIFrameElement): void => {
  iframe.style.position = "absolute";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.visibility = "hidden";
  iframe.style.zIndex = "-1";
};

/**
 * Creates a placeholder for blocked content
 * @param iframe The iframe element to block
 * @param originalSrc The original source URL of the iframe
 * @returns The created wrapper element containing the placeholder
 */
export const createContentPlaceholder = (
  iframe: HTMLIFrameElement,
  originalSrc: string
): HTMLDivElement => {
  // Create a unique ID for the placeholder
  const placeholderId = `cookie-blocked-content-${Math.random()
    .toString(36)
    .substring(2, 11)}`;

  // Get the iframe's parent element
  const parentElement = iframe.parentElement;
  if (!parentElement) {
    throw new Error("Iframe has no parent element");
  }

  // Make the iframe invisible but keep it in place
  iframe.setAttribute("data-cookie-blocked", "true");
  iframe.setAttribute("data-original-src", originalSrc);
  iframe.src = "about:blank";

  // Create a wrapper div with position relative
  const wrapper = document.createElement("div");
  applyWrapperStyles(
    wrapper,
    iframe.style.width || "100%",
    iframe.style.height || "315px"
  );

  // Add content directly to the wrapper
  wrapper.innerHTML = createPlaceholderContent(placeholderId);

  // Create the placeholder for tracking purposes only
  const placeholderElement = document.createElement("div");
  placeholderElement.id = placeholderId;
  placeholderElement.className = "cookie-consent-blocked-iframe";
  placeholderElement.setAttribute("data-cookie-consent-placeholder", "true");
  placeholderElement.setAttribute("data-blocked-src", originalSrc);
  placeholderElement.style.display = "none"; // Hide the placeholder as we're not using it for display

  // Insert the wrapper right before the iframe
  parentElement.insertBefore(wrapper, iframe);

  // Position the iframe absolutely within the wrapper to prevent layout disruption
  positionIframeAbsolutely(iframe);

  // Move the iframe inside the wrapper
  wrapper.appendChild(iframe);

  // Add the hidden placeholder to the wrapper for tracking
  wrapper.appendChild(placeholderElement);

  // Add event listener to the button
  addSettingsButtonListeners(placeholderId);

  console.debug(`[CookieKit] Added overlay placeholder ID: ${placeholderId}`);

  return wrapper;
};

/**
 * Blocks tracking scripts and iframes based on keywords
 * @param trackingKeywords Array of keywords to block
 * @returns MutationObserver that watches for new elements
 */
export const blockTrackingScripts = (
  trackingKeywords: string[]
): MutationObserver => {
  // Remove all script tags that match tracking domains
  document.querySelectorAll("script").forEach((script) => {
    if (
      script.src &&
      trackingKeywords.some((keyword) => script.src.includes(keyword))
    ) {
      console.debug(`[CookieKit] Removing script: ${script.src}`);
      script.remove();
    }
  });

  // Also block iframes from tracking domains (especially for YouTube embeds)
  document.querySelectorAll("iframe").forEach((iframe) => {
    if (
      iframe.src &&
      trackingKeywords.some((keyword) => iframe.src.includes(keyword))
    ) {
      console.debug(`[CookieKit] Blocking iframe: ${iframe.src}`);
      createContentPlaceholder(iframe, iframe.src);
    }
  });

  // Prevent new tracking scripts and iframes from being injected
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        // Handle script tags
        if (node instanceof HTMLElement && node.tagName === "SCRIPT") {
          const src = node.getAttribute("src");
          if (
            src &&
            trackingKeywords.some((keyword) => src.includes(keyword))
          ) {
            console.debug(`[CookieKit] Blocking injected script: ${src}`);
            node.remove();
          }
        }

        // Handle iframe tags (especially YouTube)
        if (node instanceof HTMLElement && node.tagName === "IFRAME") {
          const src = node.getAttribute("src");
          if (
            src &&
            trackingKeywords.some((keyword) => src.includes(keyword))
          ) {
            console.debug(`[CookieKit] Blocking injected iframe: ${src}`);
            createContentPlaceholder(node as HTMLIFrameElement, src);
          }
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return observer;
};

/**
 * Ensures that all placeholders remain visible and properly styled
 */
export const ensurePlaceholdersVisible = (): void => {
  const placeholders = document.querySelectorAll(
    '[data-cookie-consent-placeholder="true"]'
  );

  if (placeholders.length > 0) {
    console.debug(
      `[CookieKit] Ensuring ${placeholders.length} placeholders remain visible`
    );

    placeholders.forEach((placeholder) => {
      // Make sure the placeholder is visible
      if (placeholder instanceof HTMLElement) {
        placeholder.style.display = "flex";
        placeholder.style.visibility = "visible";
        placeholder.style.opacity = "1";
        placeholder.style.zIndex = "100";

        // Find the parent wrapper
        const wrapper = placeholder.parentElement;
        if (wrapper) {
          // Make sure the wrapper is properly positioned
          applyWrapperStyles(wrapper);

          // Check if we already have content in the wrapper
          const hasContent =
            wrapper.querySelector(".cookie-consent-wrapper-content") !== null ||
            wrapper.innerHTML.includes("Content Blocked");

          // If no content exists, add it directly to the wrapper
          if (!hasContent) {
            const placeholderId =
              placeholder.id ||
              `cookie-blocked-content-${Math.random()
                .toString(36)
                .substring(2, 11)}`;

            // Get the blocked source if available
            const blockedSrc =
              placeholder.getAttribute("data-blocked-src") || "unknown source";

            wrapper.innerHTML = createPlaceholderContent(placeholderId);

            // Re-append the placeholder to the wrapper
            wrapper.appendChild(placeholder);

            // Find the iframe inside the wrapper
            const iframe = wrapper.querySelector(
              "iframe"
            ) as HTMLIFrameElement | null;
            if (iframe) {
              // Position the iframe absolutely to prevent layout disruption
              positionIframeAbsolutely(iframe);

              // Make sure it's still using about:blank
              if (
                iframe.src !== "about:blank" &&
                iframe.hasAttribute("data-original-src")
              ) {
                iframe.src = "about:blank";
              }

              // Re-append the iframe to the wrapper
              wrapper.appendChild(iframe);
            }

            // Add event listener to the button
            addSettingsButtonListeners(placeholderId);
          }

          // Find the iframe inside the wrapper
          const iframe = wrapper.querySelector(
            "iframe"
          ) as HTMLIFrameElement | null;
          if (iframe) {
            // Position the iframe absolutely to prevent layout disruption
            positionIframeAbsolutely(iframe);

            // Make sure it's still using about:blank
            if (
              iframe.src !== "about:blank" &&
              iframe.hasAttribute("data-original-src")
            ) {
              iframe.src = "about:blank";
            }
          }
        }
      }
    });
  }
};
