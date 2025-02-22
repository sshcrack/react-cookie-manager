import React, { useState } from "react";

interface FloatingCookieButtonProps {
  theme?: "light" | "dark";
  onClick: () => void;
  onClose?: () => void;
}

export const FloatingCookieButton: React.FC<FloatingCookieButtonProps> = ({
  theme = "light",
  onClick,
  onClose,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        absolute bottom-6 left-6 z-[99999]
        w-16 h-16 rounded-full
        flex items-center justify-center
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        hover:scale-110 focus:outline-none
        group
        ${
          theme === "light"
            ? "bg-white/95 shadow-lg ring-1 ring-black/10 text-gray-700 hover:text-gray-900"
            : "bg-black/95 shadow-lg ring-1 ring-white/10 text-gray-300 hover:text-white"
        }
      `}
      style={{
        animation:
          "slide-in-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards",
      }}
      aria-label="Manage cookie preferences"
    >
      {/* Close button */}
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className={`
            absolute -top-2 -right-2
            w-6 h-6 rounded-full
            flex items-center justify-center
            transition-all duration-300
            hover:scale-110
            ${
              theme === "light"
                ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }
          `}
          aria-label="Close cookie button"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6L18 18" />
          </svg>
        </button>
      )}
      <style>
        {`
          @keyframes slide-in-bottom {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="transform rotate-0 hover:rotate-12 transition-transform duration-300"
      >
        {/* Half-eaten cookie - main shape */}
        <path
          d="
          M12 2
          A10 10 0 0 1 22 12
          A10 10 0 0 1 12 22
          A10 10 0 0 1 2 12
          A10 10 0 0 1 12 2
          M15 7
          A5 5 0 0 0 11 12
          A5 5 0 0 1 7 17
          A8 8 0 0 0 12 19
          A7 7 0 0 0 19 12
          A7 7 0 0 0 15 7
          Z
        "
        />

        {/* Crumbs */}
        <circle cx="19" cy="14" r="1" />
        <circle cx="17" cy="17" r="0.8" />
        <circle cx="20" cy="16" r="0.6" />
        <path d="M18 15.5L19 16.5" strokeWidth="0.8" stroke="currentColor" />
        <path d="M20 15L21 15.8" strokeWidth="0.8" stroke="currentColor" />
      </svg>
    </button>
  );
};
