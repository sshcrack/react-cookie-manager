import React from "react";

interface FloatingCookieButtonProps {
  theme?: "light" | "dark";
  onClick: () => void;
}

export const FloatingCookieButton: React.FC<FloatingCookieButtonProps> = ({
  theme = "light",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 left-6 z-[99999]
        w-12 h-12 rounded-full
        flex items-center justify-center
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        hover:scale-110 focus:outline-none
        animate-slide-up
        ${
          theme === "light"
            ? "bg-white/95 shadow-lg ring-1 ring-black/10 text-gray-700 hover:text-gray-900"
            : "bg-black/95 shadow-lg ring-1 ring-white/10 text-gray-300 hover:text-white"
        }
      `}
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        animation: "slide-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards",
      }}
      aria-label="Manage cookie preferences"
    >
      <style>
        {`
          @keyframes slide-up {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0px);
            }
          }
        `}
      </style>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transform rotate-0 hover:rotate-12 transition-transform duration-300"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="21.17" y1="8" x2="12" y2="8" />
        <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
        <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
      </svg>
    </button>
  );
};
